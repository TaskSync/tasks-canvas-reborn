import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import useStyles from "./styles";

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
      <Button className={classes.button} startIcon={<MenuIcon />}>
        New task
      </Button>
      {divider}
      <Button className={classes.button}>Edit details</Button>
      {divider}
      <IconButton
        disableRipple={true}
        className={classes.iconButton}
        aria-label="Indent"
      >
        <MenuIcon />
      </IconButton>
      <IconButton
        disableRipple={true}
        className={classes.iconButton}
        aria-label="Outdent"
      >
        <MenuIcon />
      </IconButton>
      {divider}
      <IconButton
        disableRipple={true}
        className={classes.iconButton}
        aria-label="Mode up"
      >
        <MenuIcon />
      </IconButton>
      <IconButton
        disableRipple={true}
        className={classes.iconButton}
        aria-label="Mode down"
      >
        <MenuIcon />
      </IconButton>
      {divider}
      <IconButton
        disableRipple={true}
        className={classes.iconButton}
        aria-label="Delete"
      >
        <MenuIcon />
      </IconButton>
      {divider}
      <Button className={classes.button}>
        Refresh
      </Button>

      <div className={classes.grow} />

      <Button className={classes.button}>Completed tasks</Button>
      <Button className={classes.button}>Trash</Button>
    </Toolbar>
  );
}
