import { TTask } from "./store";

const now = Date.now();

export default [
  {
    id: "id-0",
    title: "abc",
    updated: { canvas: now },
    created: now
  },
  {
    id: "id-1",
    parentID: "id-0",
    title: "123 456",
    updated: { canvas: now },
    created: now
  },
  // {
  //   id: "id-2",
  //   title: "test 3",
  //   updated: { canvas: now },
  //   created: now
  // },
  // {
  //   id: "id-3",
  //   title: "test 4",
  //   updated: { canvas: now },
  //   created: now
  // }
] as TTask[];
