import { now, TTask } from "./tasklist/model";

export default [
  {
    id: "1 foo",
    title: "1 foo",
    updated: now(),
    created: now()
  },
  {
    id: "1-2 foo",
    parent: "1 foo",
    title: "1-2 foo",
    updated: now(),
    created: now()
  },
  {
    id: "3 foo",
    previous: "1 foo",
    title: "3 foo",
    updated: now(),
    created: now()
  },
  {
    id: "4 foo",
    previous: "3 foo",
    title: "4 foo",
    updated: now(),
    created: now()
  }
] as TTask[];
