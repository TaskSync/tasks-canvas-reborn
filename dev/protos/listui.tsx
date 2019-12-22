import Checkbox from "@material-ui/core/es/Checkbox";
import List from "@material-ui/core/es/List";
import ListItem from "@material-ui/core/es/ListItem";
import ListItemIcon from "@material-ui/core/es/ListItemIcon";
import { createStyles, makeStyles, Theme } from "@material-ui/core/es/styles";
import ArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import classnames from "classnames";
import React, {
  KeyboardEvent,
  MouseEvent,
  FocusEvent,
  useState,
  useReducer,
  createRef
} from "react";
import ReactDOM from "react-dom";
import uniqid from "uniqid";

// const theme = createMuiTheme();

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      width: "100%",
      backgroundColor: "white",
      padding: 0
    },
    item: {
      height: "1.3em",
      padding: 0,
      margin: "0.1em 0",
      "&:hover": {
        // TODO !important
        "background-color": "transparent !important"
      }
    },
    selected: {
      border: "1px solid yellow",
      "border-width": "1px 0",
      // TODO !important
      "background-color": "#fffff7 !important",
      "&:hover": {
        // TODO !important
        "background-color": "#fffff7 !important"
      }
    },
    text: {
      width: "100%",
      outline: "0px solid transparent"
      // TODO no line breaks
    },
    arrow: {
      "margin-right": "10px"
    },
    checkbox: {
      padding: 0
    }
  })
);

export type TTask = {
  id: string;
  text: string;
};

const tasks: TTask[] = [
  { id: "id-0", text: "test 1" },
  { id: "id-1", text: "test 2" },
  { id: "id-2", text: "test 3" },
  { id: "id-3", text: "test 4" }
];

type Action = { type: "update"; task: TTask } | { type: "indent"; id: string };
function tasksReducer(state: TTask[], action: Action) {
  switch (action.type) {
    case "update":
      const task = state.find(task => task.id === action.task.id);
      task.text = action.task.text;
      console.log(`updated ${action.task.id} with`, task.text);
      return [...state];
    case "indent":
      // TODO
      console.log(`indent ${action.id}`);
      return [...state];
  }
}

export default function TaskList({ tasks }: { tasks: TTask[] }) {
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
        // TODO indent the task
        event.preventDefault();
        dispatchList({ type: "indent", id });
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
      dispatchList({ type: "update", task });
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
            <ListItemIcon>
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
            </ListItemIcon>
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

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<TaskList tasks={tasks} />, document.body as HTMLElement);
});
