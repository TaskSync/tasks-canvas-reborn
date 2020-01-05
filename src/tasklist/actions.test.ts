import assert from "assert";
import { newline, TNewline } from "./actions";
import { TTask, now, TTaskID, TSelection } from "./store";
import MockStore from "./store.mock";

describe("actions", () => {
  describe("newline", () => {
    const store = new MockStore();
    const actionMock: Pick<
      TNewline,
      "setFocusedID" | "setSelection" | "type" | "store"
    > = {
      setFocusedID(_: string) {},
      setSelection(_: TSelection) {},
      type: "newline",
      store
    };
    test("first child", () => {
      const tasks = factory(`
      - 1
      -- 1-2
      - 2
      `);
      const expected = normalize(`
      - 1
      -- 1
      -- 2
      - 2
      `);
      const after = newline(tasks, {
        id: "1-2",
        selection: [1, 2],
        ...actionMock
      });
      expect(tasksToString(after)).toEqual(expected);
    });
  });
});

// HELPERS

export function factory(tasks: string): TTask[] {
  let previousRoot: TTaskID | undefined;
  let previousChild: TTaskID | undefined;
  const ret: TTask[] = [];
  tasks = normalize(tasks);

  for (let line of tasks.split("\n")) {
    const isChild = line[0] === "--";
    if (isChild) {
      assert(previousRoot);
    }
    assert(!isChild || previousChild || previousRoot);
    const attrs: Partial<TTask> = isChild
      ? { parent: previousRoot, previous: previousChild }
      : { previous: previousRoot };
    const title = line.replace(/^-+/, "");

    const task = t(title, attrs);

    if (isChild) {
      previousChild = task.id;
    } else {
      previousRoot = task.id;
    }
    ret.push(task);
  }

  return ret;
}

export function tasksToString(tasks: TTask[]): string {
  let ret = "";
  for (const task of tasks) {
    ret += task.parent ? "--" : "-";
    ret += task.title + "\n";
  }
  return ret.trim();
}

export function normalize(tasks: string): string {
  let ret = "";
  for (let line of tasks.split("\n")) {
    if (!line.trim()) {
      continue;
    }
    ret += line.trim() + "\n";
  }
  return ret.trim();
}

// create a task
// text is also an ID, has to be unique
export function t(text: string, task?: Partial<TTask>): TTask {
  return {
    id: text,
    title: text,
    updated: now(),
    created: now(),
    previous: task?.previous || undefined,
    parent: task?.parent || undefined
  };
}
