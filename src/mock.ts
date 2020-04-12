import { now, TTask } from "./tasklist/model";

// TODO use test-utils.ts
export default [
  {
    id: "1 foo",
    position: 1,
    title: "1 foo",
    updated: now(),
    created: now(),
    content: "",
    duedate: "",
  },
  {
    id: "1-2 foo",
    parent: "1 foo",
    position: 1,
    title: "1-2 foo",
    updated: now(),
    created: now(),
    content: "",
    duedate: "",
  },
  {
    id: "3 foo",
    position: 2,
    title: "3 foo",
    updated: now(),
    created: now(),
    content: "",
    duedate: "",
  },
  {
    id: "4 foo",
    position: 3,
    title: "4 foo",
    updated: now(),
    created: now(),
    content: "",
    duedate: "",
  },
] as TTask[];
