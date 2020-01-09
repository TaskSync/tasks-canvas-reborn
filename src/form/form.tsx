import Checkbox from "@material-ui/core/Checkbox";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
// @ts-ignore
import deepcopy from "deepcopy";
import React, { useEffect, ChangeEvent, KeyboardEvent, useState } from "react";
import { TTask } from "../tasklist/model";
import useStyles from "./styles";

export default function({
  task,
  handleClose
}: // TODO setCompleted (dispatcher)
{
  task: TTask;
  handleClose: (task: TTask) => void;
}) {
  const classes = useStyles({});
  const [edited, setEdited] = useState<TTask>(deepcopy(task));
  let textareaNode: HTMLTextAreaElement;

  function onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setEdited({
      ...task,
      content: event.target.value
    });
  }

  function onCheckbox() {
    setEdited({ ...edited, completed: !edited.completed });
  }

  function onESC(event: KeyboardEvent<HTMLElement>) {
    console.log(event.key);
    if (event.key === "Escape") {
      handleClose(task);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      handleClose(edited);
    }
    onESC(event);
  }

  useEffect(() => {
    setTimeout(() => {
      if (textareaNode) {
        textareaNode.focus();
      }
    });
  });

  // TODO extract styles
  // TODO autofocus
  return (
    <form>
      <p>
        <a href="#" onClick={handleClose.bind(null, edited)} onKeyDown={onESC}>
          &lt; Back To List
        </a>
      </p>
      <p>
        <Checkbox
          onChange={onCheckbox}
          checked={edited.completed}
          onKeyDown={onESC}
        />{" "}
        {edited.title}
      </p>
      <TextareaAutosize
        onKeyDown={onKeyDown}
        className={classes.textarea}
        rowsMax={100}
        rowsMin={5}
        ref={(node: HTMLTextAreaElement) => {
          textareaNode = node;
        }}
        onChange={onChange}
        value={edited.content}
      />
      <p>
        <a href="#" onClick={handleClose.bind(null, edited)} onKeyDown={onESC}>
          &lt; Back To List
        </a>
      </p>
    </form>
  );
}
