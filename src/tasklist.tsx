import { ListItemSecondaryAction } from "@material-ui/core";
import Checkbox from "@material-ui/core/es/Checkbox";
import List from "@material-ui/core/es/List";
import ListItem from "@material-ui/core/es/ListItem";
import classnames from "classnames";
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
import uniqid from "uniqid";
import { Store } from "./main";
import useStyles from "./tasklist-css";
import * as ops from "./tasklist-ops";
import { TAction, getChildren } from "./tasklist-ops";
import { getCaretPosition } from "./utils";
import ArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

export type TTaskID = string;
export interface TTask {
  id: TTaskID;
  title: string;
  content?: string;
  parentID?: TTaskID;
  created: number;
  updated: {
    // must be timestamp (miliseconds)
    canvas: number | null;
  };
  isCompleted?: boolean;
}

function tasksReducer(state: TTask[], action: TAction) {
  // @ts-ignore TODO type
  return ops[action.type](state, action);
}

export default function TaskList({
  tasks,
  store
}: {
  tasks: TTask[];
  store: Store;
}) {
  const classes = useStyles({});
  const [focusedID, setFocusedID] = useState(null);
  // TODO honor the caret position (width based non-monospace fonts)
  // const [focusedCaretPos, setFocusedCaretPos] = useState(null);
  const [list, dispatchList] = useReducer(tasksReducer, tasks);
  const [focusedNode, setFocusedNode] = useState(null);
  const parentTasks = list.filter(t => t.parentID === undefined);

  store.set(list);

  function getTaskByID(id: string): TTask {
    return list.find(task => task.id === id);
  }

  function handleKey(event: KeyboardEvent<HTMLElement>) {
    const id = getDataID(event);
    const task = getTaskByID(id);
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      const index = list.indexOf(task);
      console.log("task", task.title);
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
    } else if (event.key === "Tab") {
      // indent
      event.preventDefault();
      if (event.shiftKey) {
        dispatchList({ type: "unindent", id, store });
      } else {
        dispatchList({ type: "indent", id, store });
      }
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
    } else if (event.key === "Backspace") {
      // merge with the task above
      event.preventDefault();
      dispatchList({
        type: "mergePrevLine",
        id,
        store,
        setFocusedID
      });
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
    event.preventDefault();
  }

  function handleBlur(event: FocusEvent<HTMLSpanElement>) {
    // only for content editable spans
    if (!event.target.isContentEditable) {
      return;
    }

    const id = getDataID(event);
    const task = getTaskByID(id);
    task.title = event.target.textContent;
    dispatchList({ type: "update", task, store });
  }

  useEffect(() => {
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
        {parentTasks.map(task => {
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

export function Task({
  task,
  focusedID,
  setFocusedNode
}: {
  task: TTask;
  focusedID: TTaskID;
  setFocusedNode: (HTMLElement) => void;
}) {
  const classes = useStyles({});
  const { id, title } = task;
  const labelId = `checkbox-list-label-${id}`;
  const isSelected = id === focusedID;

  const checkbox = (
    <Checkbox
      checked={task.isCompleted}
      className={classes.checkbox}
      edge="start"
      tabIndex={-1}
      disableRipple
      inputProps={{ "aria-labelledby": labelId }}
    />
  );

  // TODO inline style
  return (
    <tr data-id={id} className={classes.row}>
      <td
        className={classnames(
          classes.cell,
          classes.checkboxCell,
          isSelected ? classes.selectedCell : null
        )}
      >
        {checkbox}
      </td>
      <td
        className={classnames(
          classes.cell,
          classes.checkboxCell,
          isSelected ? classes.selectedCell : null
        )}
      >
        {checkbox}
      </td>
      <td
        className={classnames(
          classes.cell,
          classes.textCell,
          isSelected ? classes.selectedCell : null
        )}
      >
        <ArrowRightIcon className={classes.arrow} />
        <span
          contentEditable={true}
          suppressContentEditableWarning={true}
          className={classes.title}
          ref={node => {
            if (id === focusedID) {
              setFocusedNode(node);
            }
          }}
        >
          {title}
        </span>
      </td>
      <td className={classnames(classes.cell, classes.contentCell)}>
        aaaa{task.content}
      </td>
    </tr>
  );
}

/**
 * Returns the task ID from the event.
 */
function getDataID(event: SyntheticEvent<Node>): TTaskID {
  let node = event.target as Node;
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
