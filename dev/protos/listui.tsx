import Checkbox from "@material-ui/core/Checkbox";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React, { KeyboardEvent, MouseEvent, useState, useReducer } from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";

// const theme = createMuiTheme();

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: "white"
    },
    row: {
      height: "1.5em"
    },
    selected: {
      background: "grey"
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

type Action = { type: "update"; task: TTask };
function tasksReducer(state: TTask[], action: Action) {
  switch (action.type) {
    case "update":
      const task = state.find(task => task.id === action.task.id);
      task.text = action.task.text;
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
      } else {
        // edit text
        if (event.key === "Tab") {
          // catch tab for text input
          event.preventDefault();
        }
        task.text += String.fromCharCode(event.keyCode);
        dispatchList({ type: "update", task });
      }
    };
  }

  function handleClick(id: string) {
    return (event: MouseEvent<HTMLElement>) => {
      setFocusedID(id);
      event.preventDefault();
    };
  }

  return (
    <List className={classes.root}>
      {list.map(task => {
        const { id, text } = task;
        const labelId = `checkbox-list-label-${id}`;
        const isSelected = id === focusedID;

        return (
          <ListItem
            className={classnames(
              classes.row,
              isSelected ? classes.selected : null
            )}
            key={id}
            role={undefined}
            dense
            button
            onClick={handleClick(id)}
            onKeyDown={handleKey(id)}
            selected={id === focusedID}
            autoFocus={focusedID === id}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={checked.includes(id)}
                tabIndex={-1}
                disableRipple
                inputProps={{ "aria-labelledby": labelId }}
              />
            </ListItemIcon>
            <ListItemText id={labelId} primary={text} />
          </ListItem>
        );
      })}
    </List>
  );
}

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<TaskList tasks={tasks} />, document.body as HTMLElement);
});
