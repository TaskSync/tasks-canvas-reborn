import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import useStyles from "./styles";
import classnames from "classnames";

export type ToolbarProps = {};

// TODO dividers are 0 height
export default function(props: ToolbarProps) {
  const classes = useStyles({});

  const divider = (
    <Divider orientation="vertical" className={classes.divider} />
  );

  return (
    <Toolbar className={classes.toolbar}>
      <Button className={classes.button}>Clear completed</Button>
      {divider}

      <Button className={classes.button}>
        <MenuIcon /> New task
      </Button>
      {divider}

      <Button className={classes.button}>Edit details</Button>
      {divider}

      <Button className={classes.button} aria-label="Indent">
        <MenuIcon />
      </Button>
      <Button className={classes.button} aria-label="Outdent">
        <MenuIcon />
      </Button>
      {divider}

      <Button className={classes.button} aria-label="Move up">
        <MenuIcon />
      </Button>
      <Button className={classes.button} aria-label="Move down">
        <MenuIcon />
      </Button>
      {divider}

      <Button className={classes.button} aria-label="Delete">
        <MenuIcon />
      </Button>
      {divider}

      <Button className={classes.button}>Refresh</Button>

      <div className={classes.grow} />

      <Button className={classes.button}>Completed tasks</Button>
      <Button className={classes.button}>Trash</Button>
    </Toolbar>
  );
}
