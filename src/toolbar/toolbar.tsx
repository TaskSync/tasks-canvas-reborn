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
  id: TTaskID;
  selection: TSelection;
  store: Store;
  setFormVisible(id: TTaskID): void;
  showDeleted: boolean;
  setShowDeleted(show: boolean): void;
  showCompleted: boolean;
  setShowCompleted(show: boolean): void;
  dispatchList(action: TAction): void;
  setFocusedID(id: TTaskID): void;
  setSelection(selection: TSelection): void;
};

// TODO dividers are 0 height
export default function(props: ToolbarProps) {
  const {
    id,
    selection,
    store,
    setFormVisible,
    showDeleted,
    setShowDeleted,
    showCompleted,
    setShowCompleted,
    dispatchList,
    setFocusedID,
    setSelection
  } = props;
  const classes = useStyles({});

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

  function handleNewTask() {
    dispatchList({
      type: "newline",
      id,
      selection,
      store,
      setFocusedID,
      setSelection
    });
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

      <Button className={classes.button} onClick={handleNewTask}>
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
        value="null"
      >
        Completed tasks
      </ToggleButton>
      <ToggleButton
        className={classes.button}
        onClick={setShowDeleted.bind(null, !showDeleted)}
        selected={showDeleted}
        value="null"
      >
        Trash
      </ToggleButton>
    </Toolbar>
  );
}
