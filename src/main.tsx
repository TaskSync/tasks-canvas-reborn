import { saveAs } from "file-saver";
import React from "react";
import ReactDOM from "react-dom";
import mockTasks from "./mock";
import Store from "./tasklist/store";
import TaskList from "./tasklist/tasklist";

const store = new Store();
// const tasks = store.get() || mockTasks
const tasks = mockTasks

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <TaskList tasks={tasks} store={store} />,
    document.body as HTMLElement
  );
});

// TODO extract
// @ts-ignore
window.canvasExport = () => {
  const blob = new Blob([JSON.stringify(store.get())], {
    type: "application/json"
  });
  const date = new Date();
  saveAs(blob, "tasks-" + date.toISOString() + ".json");
};

// @ts-ignore
window.canvasImport = () => {
  // TODO 1 allow calling form the console with a JSON
  // TODO 2 use FileReader and an upload field
};
