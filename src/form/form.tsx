// @ts-ignore TODO types
import TextareaAutosize from "@material-ui/core/es/TextareaAutosize";
// @ts-ignore TODO types
import Checkbox from "@material-ui/core/es/Checkbox";
import React, { useEffect } from "react";
import { TTask } from "../tasklist/model";

export default function({
  task,
  handleClose
}: // TODO setCompleted (dispatcher)
{
  task: TTask;
  handleClose: () => void;
}) {
  let textareaNode: HTMLTextAreaElement;

  useEffect(() => {
    // TODO
    // textareaNode.focus();
  });

  // TODO extract styles
  // TODO rowsMax / Min
  return (
    <form>
      <p>
        <a href="#" onClick={handleClose}>
          &lt; Back To List
        </a>
      </p>
      <p>
        <Checkbox checked={task.completed} disableRipple /> {task.title}
      </p>
      <TextareaAutosize
        style={{ width: "100%" }}
        rowsMax={100}
        rowsMin={5}
        ref={(node: HTMLTextAreaElement) => {
          textareaNode = node;
        }}
        autoFocus={true}
      >
        {task.content}
      </TextareaAutosize>
    </form>
  );
}
