import Checkbox from "@material-ui/core/Checkbox";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
// @ts-ignore
import deepcopy from "deepcopy";
import React, { useEffect, ChangeEvent, KeyboardEvent, useState } from "react";
import { TTask } from "../tasklist/model";
import useStyles from "./styles";

export default function({
  task,
  handleSubmit
}: // TODO setCompleted (dispatcher)
{
  task: TTask;
  handleSubmit: (task: TTask) => void;
}) {
  const classes = useStyles({});
  const [edited, setEdited] = useState<TTask>(deepcopy(task));
  const [focusTextarea, setFocusTextarea] = useState<boolean>(true);
  let textareaNode: HTMLTextAreaElement;

  function onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setEdited({
      ...task,
      content: event.target.value
    });
  }

  function onCheckbox() {
    setEdited({ ...edited, completed: !edited.completed });
    setFocusTextarea(false)
  }

  function onESC(event: KeyboardEvent<HTMLElement>) {
    console.log(event.key);
    if (event.key === "Escape") {
      handleSubmit(task);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      handleSubmit(edited);
    }
    onESC(event);
  }

  useEffect(() => {
    if (!focusTextarea) {
      return
    }
    setTimeout(() => {
      if (textareaNode) {
        textareaNode.focus();
      }
    });
  });

  return (
    <form>
      <div className={classes.back}>
        <a href="#" onClick={handleSubmit.bind(null, edited)} onKeyDown={onESC}>
          &lt; Back To List
        </a>
      </div>
      <div className={classes.row}>
        <Checkbox
          className={classes.checkbox}
          onChange={onCheckbox}
          checked={edited.completed}
          onKeyDown={onESC}
        />{" "}
        {edited.title}
      </div>
      <div className={classes.row}>
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
      </div>
      <div className={classes.back}>
        <a href="#" onClick={handleSubmit.bind(null, edited)} onKeyDown={onESC}>
          &lt; Back To List
        </a>
      </div>
    </form>
  );
}
