import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import React, { useReducer } from "react";
import { TAction, reducer } from "../tasklist/actions";
import { TTask, TTaskID, TSelection } from "../tasklist/model";
import Store from "../tasklist/store";
import useStyles from "./styles";
import ToggleButton from "@material-ui/lab/ToggleButton";

export type ToolbarProps = {
  tasks: TTask[];
  id: TTaskID;
  selection: TSelection;
  store: Store;
  setFormVisible(id: TTaskID): void;
  showHidden: boolean;
  setShowHidden(show: boolean): void;
  showCompleted: boolean;
  setShowCompleted(show: boolean): void;
  dispatchList(action: TAction): void;
};

// TODO dividers are 0 height
export default function(props: ToolbarProps) {
  const {
    tasks,
    id,
    selection,
    store,
    setFormVisible,
    showHidden,
    setShowHidden,
    showCompleted,
    setShowCompleted
  } = props;
  const classes = useStyles({});
  const dispatchList = useReducer(reducer, tasks)[1];

  const divider = (
    <Divider orientation="vertical" className={classes.divider} />
  );

  // TODO type as TypeOf<Property<type, TAction>> (fake code)
  function actionHandler(type: string) {
    return () => {
      // @ts-ignore TODO types
      dispatchList({ type, id, selection, store });
    };
  }

  return (
    <Toolbar className={classes.toolbar}>
      <Button
        className={classes.button}
        onClick={actionHandler("clearCompleted")}
      >
        Clear completed
      </Button>
      {divider}

      <Button className={classes.button} onClick={actionHandler("newTask")}>
        <MenuIcon className={classes.buttonIcon} /> New task
      </Button>
      {divider}

      <Button
        className={classes.button}
        onClick={setFormVisible.bind(null, id)}
      >
        Edit details
      </Button>
      {divider}

      <Button
        className={classes.button}
        aria-label="Indent"
        onClick={actionHandler("indent")}
      >
        <MenuIcon />
      </Button>
      <Button
        className={classes.button}
        aria-label="Outdent"
        onClick={actionHandler("outdent")}
      >
        <MenuIcon />
      </Button>
      {divider}

      <Button
        className={classes.button}
        aria-label="Move up"
        onClick={actionHandler("moveUp")}
      >
        <MenuIcon />
      </Button>
      <Button
        className={classes.button}
        aria-label="Move down"
        onClick={actionHandler("moveDown")}
      >
        <MenuIcon />
      </Button>
      {divider}

      <Button
        className={classes.button}
        aria-label="Delete"
        onClick={actionHandler("delete")}
      >
        <MenuIcon />
      </Button>
      {divider}

      {/*
      TODO
      <Button className={classes.button}>Refresh</Button>
      */}

      <div className={classes.grow} />

      <ToggleButton
        className={classes.button}
        onClick={setShowCompleted.bind(null, !showCompleted)}
        selected={showCompleted}
      >
        Completed tasks
      </ToggleButton>
      <ToggleButton
        className={classes.button}
        onClick={setShowHidden.bind(null, !showHidden)}
        selected={showHidden}
      >
        Trash
      </ToggleButton>
    </Toolbar>
  );
}
