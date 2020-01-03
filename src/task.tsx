import Checkbox from "@material-ui/core/es/Checkbox";
import ArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import classnames from "classnames";
import React from "react";
import { TTask, TTaskID } from "./store";
import useStyles from "./tasklist-css";

function Task({
  task,
  focusedID,
  setFocusedNode,
  setNodeRef
}: {
  task: TTask;
  focusedID: TTaskID;
  setFocusedNode: (node: HTMLSpanElement) => void;
  setNodeRef: (id: string, node: HTMLSpanElement) => void;
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
        {!task.parent ? checkboxNode : null}
      </td>
      {task.parent ? (
        <td className={checkboxClasses}>{checkboxNode}</td>
      ) : null}
      <td
        colSpan={task.parent ? 1 : 2}
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
            if (!node) {
              return
            }
            setNodeRef(id, node as HTMLSpanElement);
            // TODO get focusedNode from nodeRefs
            if (id === focusedID) {
              setFocusedNode(node);
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
