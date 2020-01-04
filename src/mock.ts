import { TTask, now } from "./store";
export default [
  {
    id: "id-0",
    title: "abc",
    updated: now(),
    created: now()
  },
  {
    id: "id-1",
    parent: "id-0",
    title: "123 456",
    updated: now(),
    created: now()
  },
  {
    id: "id-2",
    previous: "id-0",
    title: "test 3",
    updated: now(),
    created: now()
  },
  {
    id: "id-3",
    previous: "id-2",
    title: "test 4",
    updated: now(),
    created: now()
  }
] as TTask[];
