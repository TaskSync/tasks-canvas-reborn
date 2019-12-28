import TaskList, { TTask, TTaskID } from "./tasklist";
import ReactDOM from "react-dom";
import React from "react";

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

let cached: TTask[];
try {
  cached = store.get();
} catch {
  // nothing
}

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <TaskList tasks={cached || tasks} store={new Store()} />,
    document.body as HTMLElement
  );
});
