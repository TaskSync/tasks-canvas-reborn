import { saveAs } from "file-saver";
import React from "react";
import ReactDOM from "react-dom";
import TaskList, { TTask } from "./tasklist";
import defaultTasks from "./mock";

export class Store {
  set(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  get() {
    return JSON.parse(localStorage.getItem("tasks"));
  }
}

const store = new Store();
let cached: TTask[];

try {
  cached = store.get();
} catch {
  // nothing
}

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <TaskList tasks={cached || defaultTasks} store={store} />,
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
