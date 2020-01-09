// @ts-ignore TODO type
import Checkbox from "@material-ui/core/es/Checkbox";
import ArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import classnames from "classnames";
import React from "react";
import { TTask, TTaskID } from "./model";
import useStyles from "./styles";

function Task({
  task,
  focusedID,
  setFocusedNode,
  setNodeRef,
  setFormVisible
}: {
  task: TTask;
  focusedID: TTaskID;
  setFocusedNode: (node: HTMLSpanElement) => void;
  setFormVisible: (id: TTaskID) => void;
  setNodeRef: (id: string, node: HTMLSpanElement) => void;
}) {
  const classes = useStyles({});
  const { id, title } = task;
  const isSelected = id === focusedID;
  const content = task.content.substr(0, 100).replace(/\n/g, "");

  const checkboxNode = (
    <Checkbox
      data-checkbox="true"
      checked={task.completed}
      className={classes.checkbox}
      disableRipple
    />
  );

  const checkboxCellClasses = classnames(
    classes.cell,
    classes.checkboxCell,
    isSelected ? classes.selectedCell : null
  );

  return (
    <tr data-id={id} className={classes.row}>
      <td className={checkboxCellClasses}>
        {!task.parent ? checkboxNode : null}
      </td>
      {task.parent ? (
        <td className={checkboxCellClasses}>{checkboxNode}</td>
      ) : null}
      <td
        colSpan={task.parent ? 1 : 2}
        className={classnames(
          classes.cell,
          classes.titleCell,
          isSelected ? classes.selectedCell : null
        )}
      >
        {isSelected ? (
          <a href="#" className={classes.arrow}>
            <ArrowRightIcon onClick={setFormVisible.bind(null, id)} />
          </a>
        ) : null}
        <span
          contentEditable={true}
          suppressContentEditableWarning={true}
          className={classes.title}
          ref={node => {
            if (!node) {
              return;
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
        <a
          href="#"
          onClick={setFormVisible.bind(null, id)}
          className={classes.content}
        >
          {content}
        </a>
      </td>
    </tr>
  );
}

export default Task;
