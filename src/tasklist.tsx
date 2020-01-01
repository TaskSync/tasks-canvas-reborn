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
import { Store, TTask, TTaskID } from "./store";
import Task from "./task";
import useStyles from "./tasklist-css";
import * as ops from "./tasklist-ops";
import { TAction, getChildren } from "./tasklist-ops";
import { getCaretPosition, isALetter } from "./utils";
import assert from "assert";

function tasksReducer(state: TTask[], action: TAction) {
  // @ts-ignore TODO type
  return ops[action.type](state, action);
}

function TaskList({ tasks, store }: { tasks: TTask[]; store: Store }) {
  const classes = useStyles({});
  const [list, dispatchList] = useReducer(tasksReducer, tasks);
  const rootTasks = list.filter((t: TTask) => t.parentID === undefined);

  // TODO generate the first empty record if length === 0
  assert(list[0].id);

  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    store.addRev(list)
    setInitialized(true);
  }

  // counts the chars typed / deleted per task since the last undo snapshot
  const [charsSinceUndo, setCharsSinceUndo] = useState<number>(0);
  const [undoTimer, setUndoTimer] = useState<number | undefined>(undefined);
  const [duringUndo, setDuringUndo] = useState<boolean>(false);

  const [focusedID, setFocusedID] = useState<string>(list[0].id);
  let focusedNode: HTMLSpanElement | undefined;
  function setFocusedNode(node: HTMLSpanElement) {
    focusedNode = node;
  }

  function getTaskByID(id: string): TTask {
    return list.find((task: TTask) => task.id === id);
  }

  function resetUndo() {
    setCharsSinceUndo(0);
    if (undoTimer !== undefined) {
      clearTimeout(undoTimer);
    }
    setUndoTimer(undefined);
  }

  function handleKey(event: KeyboardEvent<HTMLElement>) {
    const id = getDataID(event);
    const task = getTaskByID(id);

    const undoPressed =
      String.fromCharCode(event.keyCode).toLowerCase() === "z" &&
      event.altKey &&
      !event.shiftKey &&
      !event.metaKey;
    const redoPressed =
      String.fromCharCode(event.keyCode).toLowerCase() === "z" &&
      event.altKey &&
      event.shiftKey &&
      !event.metaKey;

    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      const index = list.indexOf(task);
      let indexChanged;
      // navigate between tasks
      if (event.key === "ArrowDown") {
        // move down
        indexChanged = Math.min(index + 1, list.length - 1);
      } else {
        // move up
        indexChanged = Math.max(index - 1, 0);
      }
      setFocusedID(list[indexChanged].id);
      event.preventDefault();
      resetUndo();
    } else if (event.key === "Tab") {
      // indent
      event.preventDefault();
      if (event.shiftKey) {
        dispatchList({ type: "unindent", id, store });
      } else {
        dispatchList({ type: "indent", id, store });
      }
      resetUndo();
    } else if (event.key === "Enter") {
      // break a task into two (or start a new one)
      event.preventDefault();
      dispatchList({
        type: "newline",
        id,
        store,
        pos: getCaretPosition(event.target),
        setFocusedID
      });
      resetUndo();
    } else if (
      event.key === "Backspace" &&
      // @ts-ignore
      event.target.isContentEditable &&
      getCaretPosition(event.target) === 0
    ) {
      // merge with the task above
      event.preventDefault();
      dispatchList({
        type: "mergePrevLine",
        id,
        store,
        setFocusedID
      });
      resetUndo();
    } else if (undoPressed) {
      setDuringUndo(true);
      event.preventDefault();
      dispatchList({ type: "undo", store });
    } else if (redoPressed) {
      setDuringUndo(true);
      event.preventDefault();
      dispatchList({ type: "redo", store });
    } else if (
      // REGULAR TYPING
      // @ts-ignore
      event.target.isContentEditable &&
      (isALetter(String.fromCharCode(event.keyCode)) ||
        event.key === "Backspace")
    ) {
      // increase the chars counter
      setCharsSinceUndo(charsSinceUndo + 1);

      // @ts-ignore
      const title = event.target.textContent;
      if (charsSinceUndo >= store.charsPerUndo) {
        dispatchList({ type: "update", id, title, store });
        resetUndo();
      } else if (undoTimer === undefined) {
        // @ts-ignore
        setUndoTimer(
          setTimeout(() => {
            console.log("undo timer");
            dispatchList({ type: "update", id, title, store });
            resetUndo();
          }, store.msPerUndo)
        );
      }
    }
  }

  function handleClick(event: MouseEvent<HTMLElement>) {
    const id = getDataID(event);
    const target = event.target as HTMLInputElement;
    if (target?.tagName?.toLowerCase() === "input") {
      dispatchList({
        type: "completed",
        id,
        completed: target.checked,
        store
      });
    }
    setFocusedID(id);
  }

  function handleBlur(event: FocusEvent<HTMLSpanElement>) {
    if (duringUndo) {
      return;
    }
    // only for content editable spans
    if (!event.target.isContentEditable) {
      return;
    }

    const id = getDataID(event);
    dispatchList({
      type: "update",
      store,
      id,
      title: event.target.textContent || ""
    });
    resetUndo();
  }

  useEffect(() => {
    setDuringUndo(false);
    if (!focusedNode) {
      return;
    }
    // TODO broken by a double re-render
    // retain the caret position
    if (focusedNode !== document.activeElement) {
      focusedNode.focus();
    }
  });

  return (
    <table
      className={classes.table}
      onClick={handleClick}
      onKeyDown={handleKey}
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
