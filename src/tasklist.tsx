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
  useEffect
} from "react";
import uniqid from "uniqid";
import { Store } from "./main";
import useStyles from "./tasklist-css";
import * as ops from "./tasklist-ops";
import { TAction } from "./tasklist-ops";
import { getCaretPosition } from "./utils";

export type TTaskID = string;
export interface TTask {
  id: TTaskID;
  title: string;
  content?: string;
  parentID?: TTaskID;
  created: number
  updated: {
    // must be timestamp (miliseconds)
    canvas: number | null;
  };
  isCompleted?: boolean;
}

function tasksReducer(state: TTask[], action: TAction) {
  // TODO type
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
  let focusedNode;

  function getTaskByID(id: string): TTask {
    return list.find(task => task.id === id);
  }
  // TODO delegate
  function handleKey(id: string, event: KeyboardEvent<HTMLElement>) {
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
      const type = event.shiftKey ? 'unindent' : 'indent'
      // TODO struct typing
      dispatchList({ type, id, store });
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
      setFocusedID(null);
    }
  }

  // TODO delegate
  function handleClick(id: string, event: MouseEvent<HTMLElement>) {
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

  // TODO delegate
  function handleBlur(id: string, event: FocusEvent<HTMLSpanElement>) {
    const task = getTaskByID(id);
    task.title = event.target.textContent;
    dispatchList({ type: "update", task, store });
  }

  useEffect(() => {
    if (!focusedNode) {
      return;
    }
    focusedNode.focus();
  });

  return (
    <List className={classes.list}>
      {list.map((task) => {
        const { id, title } = task;
        const labelId = `checkbox-list-label-${id}`;
        const isSelected = id === focusedID;
        const domID = uniqid();

        return (
          <ListItem
            disableRipple
            className={classnames(
              classes.item,
              isSelected ? classes.selected : null,
              task.parentID ? classes.indent : null
            )}
            key={id}
            role={undefined}
            dense
            button
            onClick={handleClick.bind(null, id)}
            onKeyDown={handleKey.bind(null, id)}
          >
            <Checkbox
              checked={task.isCompleted}
              className={classes.checkbox}
              edge="start"
              tabIndex={-1}
              disableRipple
              inputProps={{ "aria-labelledby": labelId }}
            />
            <span
              onBlur={handleBlur.bind(null, id)}
              id={domID}
              contentEditable={true}
              suppressContentEditableWarning={true}
              className={classes.text}
              ref={node => {
                if (id === focusedID ) {
                  focusedNode = node;
                }
              }}
            >
              {title}
            </span>
          </ListItem>
        );
      })}
    </List>
  );
}
