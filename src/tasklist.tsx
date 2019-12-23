import Checkbox from "@material-ui/core/es/Checkbox";
import List from "@material-ui/core/es/List";
import ListItem from "@material-ui/core/es/ListItem";
import ArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import classnames from "classnames";
import React, {
  KeyboardEvent,
  MouseEvent,
  FocusEvent,
  useState,
  useReducer
} from "react";
import uniqid from "uniqid";
import useStyles from "./tasklist-css";
import * as ops from './tasklist-ops'

export type TTask = {
  id: string;
  text: string;
};

type TActionBase = {
  store: {
    get(): TTask[];
    set(tasks: TTask[]);
  };
};

export type TAction =
  | { type: "update"; task: TTask } & TActionBase
  | { type: "indent"; id: string } & TActionBase
  | { type: "break"; id: string; pos: number } & TActionBase;

function tasksReducer(state: TTask[], action: TAction) {
  return ops[action.type]
}

export default function TaskList({ tasks, store }: { tasks: TTask[] }) {
  const classes = useStyles({});
  const [checked, setChecked] = useState([]);
  const [focusedID, setFocusedID] = useState(null);
  const [list, dispatchList] = useReducer(tasksReducer, tasks);

  function getTaskByID(id: string): TTask {
    return list.find(task => task.id === id);
  }

  // TODO delegate
  function handleKey(id: string) {
    return (event: KeyboardEvent<HTMLElement>) => {
      const task = getTaskByID(id);
      if (["ArrowDown", "ArrowUp"].includes(event.key)) {
        const index = list.indexOf(task);
        console.log("task", task.text);
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
        dispatchList({ type: "indent", id, store });
      } else if (event.key === "Enter") {
        // break a task into two (or start a new one)
        event.preventDefault();
        dispatchList({ type: "break", id, store });
      }
    };
  }

  // TODO delegate
  function handleClick(id: string) {
    return (event: MouseEvent<HTMLElement>) => {
      setFocusedID(id);
      event.preventDefault();
    };
  }

  // TODO delegate
  function handleBlur(id: string) {
    return (event: FocusEvent<HTMLSpanElement>) => {
      const task = getTaskByID(id);
      task.text = event.target.textContent;
      dispatchList({ type: "update", task, store });
    };
  }

  return (
    <List className={classes.list}>
      {list.map(task => {
        const { id, text } = task;
        const labelId = `checkbox-list-label-${id}`;
        const isSelected = id === focusedID;
        const domID = uniqid();

        return (
          <ListItem
            disableRipple
            className={classnames(
              classes.item,
              isSelected ? classes.selected : null
            )}
            key={id}
            role={undefined}
            dense
            button
            onClick={handleClick(id)}
            onKeyDown={handleKey(id)}
            selected={id === focusedID}
          >
            {/*TODO fix the array children error */}
            <ArrowDownIcon className={classes.arrow} />
            <Checkbox
              className={classes.checkbox}
              edge="start"
              checked={checked.includes(id)}
              tabIndex={-1}
              disableRipple
              inputProps={{ "aria-labelledby": labelId }}
            />
            <span
              onBlur={handleBlur(id)}
              id={domID}
              contentEditable={true}
              suppressContentEditableWarning={true}
              className={classes.text}
            >
              {text}
            </span>
          </ListItem>
        );
      })}
    </List>
  );
}
