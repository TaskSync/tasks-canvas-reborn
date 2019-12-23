import TaskList, { TTask } from "./tasklist";
import ReactDOM from "react-dom";

const tasks: TTask[] = [
  { id: "id-0", text: "test 1" },
  { id: "id-1", text: "test 2" },
  { id: "id-2", text: "test 3" },
  { id: "id-3", text: "test 4" }
];

document.addEventListener("DOMContentLoaded", () => {
  ReactDOM.render(<TaskList tasks={tasks} />, document.body as HTMLElement);
});
