import TaskList, { TTask } from "./tasklist";
import ReactDOM from "react-dom";
import React from "react";

const tasks: TTask[] = [
  { id: "id-0", title: "test 1", updated: { canvas: Date.now() } },
  {
    id: "id-1",
    parentID: "id-0",
    title: "test 2",
    updated: { canvas: Date.now() }
  },
  { id: "id-2", title: "test 3", updated: { canvas: Date.now() } },
  { id: "id-3", title: "test 4", updated: { canvas: Date.now() } }
];

const store = {
  set(tasks) {
    localStorage.setItem("tasks", tasks);
  },
  get() {
    return localStorage.getItem("tasks");
  }
};

const cached = store.get() && JSON.parse(store.get())

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(
    <TaskList tasks={cached || tasks} store={store} />,
    document.body as HTMLElement
  );
});
