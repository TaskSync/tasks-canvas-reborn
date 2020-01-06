import assert from "assert";
import React, {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useReducer,
  useState,
  useEffect,
  SyntheticEvent,
  Fragment
} from "react";
// @ts-ignore
import { setRange } from "selection-ranges";
import * as actions from "./actions";
import { TAction } from "./actions";
import { getChildren, createTask, TSelection, TTask, TTaskID } from "./model";
import { Store } from "./store";
import useStyles from "./styles";
import Task from "./task";
import { getSelection, isMacOS } from "./utils";
import { useBeforeunload } from "react-beforeunload";
import debug from "debug";

const log = debug("canvas");

function tasksReducer(state: TTask[], action: TAction): TTask[] {
  switch (action.type) {
    case "completed":
      return actions.completed(state, action);
    case "indent":
      return actions.indent(state, action);
    case "mergePrevLine":
      return actions.mergePrevLine(state, action);
    case "newline":
      return actions.newline(state, action);
    case "outdent":
      return actions.outdent(state, action);
    case "redo":
      return actions.redo(state, action);
    case "undo":
      return actions.undo(state, action);
    case "update":
      return actions.update(state, action);
    case "moveUp":
      return actions.moveUp(state, action);
    case "moveDown":
      return actions.moveDown(state, action);
  }
  return state;
}

function TaskList({ tasks, store }: { tasks: TTask[]; store: Store }) {
  const classes = useStyles({});
  const [list, dispatchList] = useReducer(tasksReducer, tasks || []);
  const rootTasks = list.filter((t: TTask) => !t.parent);

  // there always at least one task
  if (!list.length) {
    list.push(createTask());
  }

  // FOCUS & SELECTION

  const [focusedID, setFocusedID] = useState<TTaskID>(list[0].id);
  const [selection, setSelection] = useState<TSelection>([0, 0]);
  let focusedNode: HTMLSpanElement | undefined;
  function setFocusedNode(node: HTMLSpanElement) {
    focusedNode = node;
  }
  let nodeRefs: { [id: string]: HTMLSpanElement } = {};
  function setNodeRef(id: TTaskID, node: HTMLSpanElement) {
    // TODO GC old nodes by comparing with `list`
    nodeRefs[id] = node;
  }

  // INITIALIZE

  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    store.set(list, list[0].id, selection);
    setInitialized(true);
  }

  // UNDO

  // counts the chars typed / deleted per task since the last undo snapshot
  const [charsSinceUndo, setCharsSinceUndo] = useState<number>(0);
  const [undoTimer, setUndoTimer] = useState<number | undefined>(undefined);
  const [duringUndo, setDuringUndo] = useState<boolean>(false);
  // manually set the contentEditable
  const [manualTaskTitle, setManualTaskTitle] = useState<{
    id: TTaskID;
    title: string;
  } | null>(null);

  // TYPING

  let selectionBeforeTyping: TSelection | null = null;
  let titleBeforeTyping: string | null = null;

  // PERSIST ON PAGE UNLOAD
  // TODO doesnt work with refresh

  useBeforeunload(() => {
    const node = nodeRefs[focusedID];
    if (!node) {
      return;
    }
    dispatchList({
      type: "update",
      store,
      id: focusedID,
      title: node.textContent || "",
      selection
    });
  });

  // HELPERS

  function getTaskByID(id: string): TTask {
    const task = list.find((task: TTask) => task.id === id);
    assert(task, `task ${id} not found`);
    return task!;
  }

  function resetUndoCounters() {
    log("resetUndoCounters");
    setCharsSinceUndo(0);
    if (undoTimer !== undefined) {
      clearTimeout(undoTimer);
    }
    setUndoTimer(undefined);
  }

  function persistSelection(id: TTaskID, node: HTMLElement): TSelection {
    setFocusedID(id);
    const def: TSelection = [0, 0];
    if (!node.isContentEditable || duringUndo) {
      return def;
    }
    const selection = getSelection(node);
    if (selection !== undefined) {
      setSelection(selection);
      log("persistSelection", id, selection);
    }
    return selection || def;
  }

  // HANDLERS

  /**
   * Handles:
   * - tab
   * - arrow up / down
   * - backspace (beginning of a line)
   * - selection deletion (along with keyUp)
   */
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    const id = getDataID(event);
    const task = getTaskByID(id);
    const target = event.target as HTMLElement;
    titleBeforeTyping = target.textContent || "";

    // always save text before performing other action
    function createRevision() {
      log("createRevision");
      dispatchList({
        type: "update",
        store,
        id,
        title: target.textContent || "",
        selection
      });
      resetUndoCounters();
    }

    const undoPressed =
      String.fromCharCode(event.keyCode).toLowerCase() === "z" &&
      !event.altKey &&
      !event.shiftKey &&
      event.metaKey;
    const redoPressed =
      String.fromCharCode(event.keyCode).toLowerCase() === "z" &&
      !event.altKey &&
      event.shiftKey &&
      event.metaKey;

    // SWITCH TASKS
    if (["ArrowDown", "ArrowUp"].includes(event.key) && !isModifierKey(event)) {
      const index = list.indexOf(task);
      let newIndex;
      // navigate between tasks
      if (event.key === "ArrowDown") {
        // move down
        newIndex = Math.min(index + 1, list.length - 1);
      } else {
        // move up
        newIndex = Math.max(index - 1, 0);
      }
      const id = list[newIndex].id;
      if (focusedID !== id) {
        // collapse the selection
        setSelection([selection[1], selection[1]]);
        setFocusedID(list[newIndex].id);
      }
      event.preventDefault();
    }

    // MOVE
    else if (
      ["ArrowDown", "ArrowUp"].includes(event.key) &&
      isModifierKey(event)
    ) {
      if (event.key === "ArrowUp") {
        dispatchList({ type: "moveUp", id, store, selection: selection });
      } else {
        dispatchList({ type: "moveDown", id, store, selection: selection });
      }
    }

    // INDENT OUTDENT
    else if (event.key === "Tab") {
      event.preventDefault();
      createRevision();
      if (event.shiftKey) {
        dispatchList({ type: "outdent", id, store, selection: selection });
      } else {
        dispatchList({ type: "indent", id, store, selection: selection });
      }
    }

    // NEWLINE
    else if (event.key === "Enter") {
      // break a task into two (or start a new one)
      event.preventDefault();
      createRevision();
      dispatchList({
        type: "newline",
        id,
        store,
        selection,
        setFocusedID,
        setSelection
      });
    }

    // MERGE
    else if (
      event.key === "Backspace" &&
      target.isContentEditable &&
      selection[0] === 0 &&
      selection[1] === 0
    ) {
      // merge with the task above
      event.preventDefault();
      dispatchList({
        type: "mergePrevLine",
        id,
        selection,
        store,
        setFocusedID,
        setSelection
      });
      // reset undo bc of an action
      resetUndoCounters();
    }

    // UNDO REDO
    else if (undoPressed || redoPressed) {
      setDuringUndo(true);
      event.preventDefault();
      if (undoPressed) {
        // always save the newest version (if changed)
        createRevision();
        dispatchList({
          type: "undo",
          store,
          setSelection,
          setFocusedID,
          setManualTaskTitle
        });
      } else {
        // reset undo to avoid a fake revision
        resetUndoCounters();
        dispatchList({
          type: "redo",
          store,
          setSelection,
          setFocusedID,
          setManualTaskTitle
        });
      }
    }

    // DELETE SELECTION
    else if (selection[0] != selection[1]) {
      // memorize the selection to check if it has been deleted on keyUp
      selectionBeforeTyping = selection;
    }
  }

  function isModifierKey(event: KeyboardEvent) {
    return isMacOS() ? event.metaKey : event.ctrlKey;
  }

  /**
   * Handles:
   * - typing
   * - task switching with arrows
   * - selection deletion
   */
  function handleKeyUp(event: KeyboardEvent<HTMLElement>) {
    const id = getDataID(event);
    const target = event.target as HTMLElement;

    if (!target.isContentEditable) {
      return;
    }

    // TASK SWITCHING
    if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
      persistSelection(id, target);
      return;
    }

    // TYPING ON A SELECTION
    const title = target.textContent || "";
    if (selectionBeforeTyping && title !== titleBeforeTyping) {
      const selection = persistSelection(id, target);

      dispatchList({ type: "update", id, title, store, selection });
    }
    // TYPING
    else if (!selectionBeforeTyping && title !== titleBeforeTyping) {
      const selection = persistSelection(id, target);

      // increase the chars counter
      setCharsSinceUndo(charsSinceUndo + 1);

      if (charsSinceUndo >= store.charsPerUndo) {
        // create a revision after an X amount of modifications
        dispatchList({ type: "update", id, title, store, selection });
        resetUndoCounters();
      } else if (undoTimer === undefined) {
        // handle a time-based revision
        setUndoTimer(setTimeout(createRev, store.msPerUndo));
        function createRev() {
          log("undo timer");
          // get the newest version
          const title = nodeRefs[id].textContent || "";
          // save
          dispatchList({
            type: "update",
            id,
            title,
            store,
            selection
          });
          resetUndoCounters();
        }
      }
    }
  }

  // used to identify a (delegated) click on one-of-many-and-all nodes
  // composing a material-ui checkbox
  function isCheckbox(target: HTMLElement, root: HTMLElement): boolean {
    if (target?.tagName?.toLowerCase() === "input") {
      return true;
    }

    let node = target;
    do {
      if (node?.tagName?.toLowerCase() === "input") {
        return true;
      } else if (node?.dataset.checkbox) {
        return true;
      }
      node = node?.parentElement || target;
    } while (node && node !== root);

    return false;
  }

  function handleClick(event: MouseEvent<HTMLElement>) {
    const id = getDataID(event);
    const target = event.target as HTMLElement;

    // persist the selection
    // hooks get updated in the next re-render, so take the newest selection
    const selection = persistSelection(id, target);

    // CHECKBOX
    if (isCheckbox(target, event.currentTarget)) {
      const input = target as HTMLInputElement;
      // save changes (if any) using a refNode
      if (nodeRefs[id]) {
        dispatchList({
          type: "update",
          store,
          id,
          title: nodeRefs[id].textContent || "",
          selection
        });
      }
      // flip the checkbox
      dispatchList({
        type: "completed",
        id,
        completed: !input.checked,
        store,
        selection
      });
      event.preventDefault();
    }

    // undo for switching tasks
    if (id !== focusedID) {
      store.addRev(list, id, selection);
    }
  }

  function handleBlur(event: FocusEvent<HTMLSpanElement>) {
    if (duringUndo) {
      log("skipping blur bc of duringUndo");
      return;
    }
    // only for content editable spans
    if (!event.target.isContentEditable) {
      return;
    }

    const id = getDataID(event);
    log("blur save");
    dispatchList({
      type: "update",
      store,
      id,
      title: event.target.textContent || "",
      selection: getSelection(event.target) ?? selection
    });
    resetUndoCounters();
  }

  // restore the focus and selection
  useEffect(() => {
    setDuringUndo(false);
    if (!focusedNode) {
      return;
    }
    // focus if not already
    if (focusedNode !== document.activeElement) {
      focusedNode.focus();
    }
    // restore the selection
    // log("restore caret", selection);
    setRange(focusedNode, { start: selection[0], end: selection[1] });
  });

  // manually update the contentEditable (for undo / redo)
  useEffect(() => {
    if (!manualTaskTitle) {
      return;
    }
    log("restore setTaskTitle", manualTaskTitle);
    nodeRefs[manualTaskTitle.id].textContent = manualTaskTitle.title;
    setManualTaskTitle(null);
  });

  return (
    <table
      className={classes.table}
      onMouseUp={handleClick}
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <tbody>
        {rootTasks.map((task: TTask) => {
          const children = [];
          for (const child of getChildren(task.id, list)) {
            children.push(
              <Task
                key={child.id}
                task={child}
                focusedID={focusedID}
                setFocusedNode={setFocusedNode}
                setNodeRef={setNodeRef}
              />
            );
          }
          return (
            <Fragment key={task.id}>
              <Task
                key={task.id}
                task={task}
                focusedID={focusedID}
                setFocusedNode={setFocusedNode}
                setNodeRef={setNodeRef}
              />
              {children}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Returns the task ID from the event.
 */
function getDataID(event: SyntheticEvent<Node>): TTaskID {
  let node = event.target as Node | null;
  while (node) {
    // @ts-ignore
    if (node.dataset?.id) {
      // @ts-ignore
      return node.dataset.id;
    }
    node = node.parentNode;
  }
  throw new Error("missing [data-id]");
}

export default TaskList;
