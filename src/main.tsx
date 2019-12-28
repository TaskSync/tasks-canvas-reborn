import { saveAs } from "file-saver";
import React from "react";
import ReactDOM from "react-dom";
import TaskList, { TTask } from "./tasklist";

const now = Date.now();

const tasks: TTask[] = [
  { id: "id-0", title: "test 1", updated: { canvas: now }, created: now },
  {
    id: "id-1",
    parentID: "id-0",
    title: "test 2",
    updated: { canvas: now },
    created: now
  },
  { id: "id-2", title: "test 3", updated: { canvas: now }, created: now },
  { id: "id-3", title: "test 4", updated: { canvas: now }, created: now }
];

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
    <TaskList tasks={cached || tasks} store={store} />,
    document.body as HTMLElement
  );
});

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
  // TODO use FileReader and an upload field
};
