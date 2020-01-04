import { saveAs } from "file-saver";
import React from "react";
import ReactDOM from "react-dom";
import TaskList from "./tasklist";
import defaultTasks from "./mock";
import Store, { TTask } from "./store";

const store = new Store();
let cached: TTask[] | null;

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
