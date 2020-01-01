import Checkbox from "@material-ui/core/es/Checkbox";
import ArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import classnames from "classnames";
import React from "react";
import { TTask, TTaskID } from "./store";
import useStyles from "./tasklist-css";

function Task({
  task,
  focusedID,
  setFocusedNode
}: {
  task: TTask;
  focusedID: TTaskID;
  setFocusedNode: (node: HTMLElement) => void;
}) {
  const classes = useStyles({});
  const { id, title } = task;
  const labelId = `checkbox-list-label-${id}`;
  const isSelected = id === focusedID;

  const checkboxNode = (
    <Checkbox
      checked={task.isCompleted}
      className={classes.checkbox}
      edge="start"
      tabIndex={-1}
      disableRipple
      inputProps={{ "aria-labelledby": labelId }}
    />
  );

  const checkboxClasses = classnames(
    classes.cell,
    classes.checkboxCell,
    isSelected ? classes.selectedCell : null
  );

  return (
    <tr data-id={id} className={classes.row}>
      <td className={checkboxClasses}>
        {!task.parentID ? checkboxNode : null}
      </td>
      {task.parentID ? (
        <td className={checkboxClasses}>{checkboxNode}</td>
      ) : null}
      <td
        colSpan={task.parentID ? 1 : 2}
        className={classnames(
          classes.cell,
          classes.titleCell,
          isSelected ? classes.selectedCell : null
        )}
      >
        {isSelected ? <ArrowRightIcon className={classes.arrow} /> : null}
        <span
          contentEditable={true}
          suppressContentEditableWarning={true}
          className={classes.title}
          ref={node => {
            if (id === focusedID) {
              setFocusedNode(node!);
            }
          }}
        >
          {title}
        </span>
      </td>
      <td className={classnames(classes.cell, classes.contentCell)}>
        {task.content}
      </td>
    </tr>
  );
}

export default Task;
