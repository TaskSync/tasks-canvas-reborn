import assert from "assert";
import {
  newline,
  TNewline,
  TIndent,
  indent,
  TAction,
  TOutdent,
  outdent,
  TMergePrevLine,
  mergePrevLine,
  TMoveUp,
  moveUp,
  TMoveDown,
  moveDown
} from "./actions";
import { now, TSelection, TTask, TTaskID } from "./model";
import MockStore from "./store.mock";

// debugger;

describe("actions", () => {
  // mock
  const store = new MockStore();

  function testStructure(
    action: (tasks: TTask[], action: TAction) => TTask[],
    actionData: Partial<TAction>
  ) {
    return function(
      _: string,
      input: string,
      output: string,
      id: TTaskID,
      selection: TSelection
    ) {
      const tasks = factory(input);
      const expected = normalize(output);
      // @ts-ignore
      const after = action(tasks, {
        id,
        selection,
        ...actionData
      });
      expect(tasksToString(after)).toEqual(expected);
    };
  }

  // basic task list for no-change cases
  const oneTwoThree = `
    - 1
    - 2
    - 3`;

  describe("newline", () => {
    // mock
    const newlineMock: Pick<
      TNewline,
      "setFocusedID" | "setSelection" | "type" | "store"
    > = {
      setFocusedID(_: string) {},
      setSelection(_: TSelection) {},
      type: "newline",
      store
    };

    const tests = [
      [
        "fist root",
        // input
        `- 1
         - 2`,
        // output
        `- 1
         - 
         - 2`,
        // id
        "1",
        // selection
        [1, 1]
      ],

      [
        "middle root",
        // input
        `- 1
         - 2
         - 3`,
        // output
        `- 1
         - 2
         - 
         - 3`,
        // id
        "2",
        // selection
        [1, 1]
      ],

      [
        "last root",
        // input
        `- 1
         - 2`,
        // output
        `- 1
         - 2
         - `,
        // id
        "2",
        // selection
        [1, 1]
      ],

      [
        "first child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // output
        `- 1
         -- 1
         -- 1
         -- 1-2
         - 2`,
        // id
        "1-1",
        // selection
        [1, 2]
      ],

      [
        "middle child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         -- 1-3
         - 2`,
        // output
        `- 1
         -- 1-1
         -- 1
         -- 2
         -- 1-3
         - 2`,
        // id
        "1-2",
        // selection
        [1, 2]
      ],

      [
        "last child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // output
        `- 1
         -- 1-1
         -- 1
         -- 2
         - 2`,
        // id
        "1-2",
        // selection
        [1, 2]
      ]
    ];

    test.each(tests)(
      "%s",
      // @ts-ignore
      testStructure(newline, newlineMock)
    );
  });

  describe("indent", () => {
    // mock
    const indentMock: Pick<TIndent, "type" | "store"> = {
      type: "indent",
      store
    };

    const tests = [
      [
        // no-change
        "first root",
        // input
        oneTwoThree,
        // output
        oneTwoThree,
        // id
        "1",
        // selection
        [0, 0]
      ],

      [
        "middle root",
        // input
        `- 1
         - 2
         - 3`,
        // output
        `- 1
         -- 2
         - 3`,
        // id
        "2",
        // selection
        [0, 0]
      ],

      [
        "last root",
        // input
        `- 1
         - 2
         - 3`,
        // output
        `- 1
         - 2
         -- 3`,
        // id
        "3",
        // selection
        [0, 0]
      ],

      [
        // no-change
        "first child",
        // input
        `- 1
         -- 1-1
         - 2`,
        // output
        `- 1
         -- 1-1
         - 2`,
        // id
        "1-1",
        // selection
        [0, 0]
      ],

      [
        // no-change
        "last child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // output
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // id
        "1-2",
        // selection
        [0, 0]
      ],

      [
        // no-change
        "preserve the selection",
        // input
        `- 1
         -- 1-1
         - 2`,
        // output
        `- 1
         -- 1-1
         - 2`,
        // id
        "1-1",
        // selection
        [0, 1]
      ],

      [
        "with children",
        // input
        `- 1
         - 2
         -- 2-1
         - 3`,
        // output
        `- 1
         -- 2
         -- 2-1
         - 3`,
        // id
        "2",
        // selection
        [0, 1]
      ],

      [
        "last root with children",
        // input
        `- 1
         - 2
         -- 2-1`,
        // output
        `- 1
         -- 2
         -- 2-1`,
        // id
        "2",
        // selection
        [0, 1]
      ],

      [
        "merge children",
        // input
        `- 1
         -- 1-1
         - 2
         -- 2-1
         - 3`,
        // output
        `- 1
         -- 1-1
         -- 2
         -- 2-1
         - 3`,
        // id
        "2",
        // selection
        [0, 1]
      ]
    ];

    test.each(tests)(
      "%s",
      // @ts-ignore
      testStructure(indent, indentMock)
    );
  });

  describe("outdent", () => {
    // mock
    const outdentMock: Pick<TOutdent, "type" | "store"> = {
      type: "outdent",
      store
    };

    const tests = [
      [
        // no-change
        "first root",
        // input
        oneTwoThree,
        // output
        oneTwoThree,
        // id
        "1",
        // selection
        [0, 0]
      ],

      [
        "middle root",
        // input
        oneTwoThree,
        // output
        oneTwoThree,
        // id
        "2",
        // selection
        [0, 0]
      ],

      [
        "last root",
        // input
        oneTwoThree,
        // output
        oneTwoThree,
        // id
        "3",
        // selection
        [0, 0]
      ],

      [
        "only child",
        // input
        `- 1
         -- 1-1
         - 2`,
        // output
        `- 1
         - 1-1
         - 2`,
        // id
        "1-1",
        // selection
        [0, 0]
      ],

      [
        "first child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // output
        `- 1
         - 1-1
         -- 1-2
         - 2`,
        // id
        "1-1",
        // selection
        [0, 0]
      ],

      [
        "last child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // output
        `- 1
         -- 1-1
         - 1-2
         - 2`,
        // id
        "1-2",
        // selection
        [0, 0]
      ],

      [
        "last child on the list",
        // input
        `- 1
         -- 1-1`,
        // output
        `- 1
         - 1-1`,
        // id
        "1-1",
        // selection
        [0, 0]
      ]
    ];

    test.each(tests)(
      "%s",
      // @ts-ignore
      testStructure(outdent, outdentMock)
    );
  });

  describe("mergePrevLine", () => {
    // mock
    const mergePrevLineMock: Pick<
      TMergePrevLine,
      "type" | "store" | "setFocusedID" | "setSelection"
    > = {
      type: "mergePrevLine",
      store,
      setFocusedID(_: TTaskID) {},
      setSelection(_: TSelection) {}
    };

    const tests = [
      [
        // no-change
        "first root",
        // input
        oneTwoThree,
        // output
        oneTwoThree,
        // id
        "1",
        // selection
        [0, 0]
      ],

      [
        "middle root",
        // input
        `- 1
         - 2
         - 3`,
        // output
        `- 1 2
         - 3`,
        // id
        "2",
        // selection
        [0, 0]
      ],

      [
        "last root",
        // input
        `- 1
         - 2
         - 3`,
        // output
        `- 1
         - 2 3`,
        // id
        "3",
        // selection
        [0, 0]
      ],

      [
        "only child",
        // input
        `- 1
         -- 1-1
         - 2`,
        // output
        `- 1 1-1
         - 2`,
        // id
        "1-1",
        // selection
        [0, 0]
      ],

      [
        "middle child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         -- 1-3
         - 2`,
        // output
        `- 1 
         -- 1-1 1-2
         -- 1-3
         - 2`,
        // id
        "1-2",
        // selection
        [0, 0]
      ],

      [
        "last child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         -- 1-3
         - 2`,
        // output
        `- 1 
         -- 1-1
         -- 1-2 1-3
         - 2`,
        // id
        "1-3",
        // selection
        [0, 0]
      ],

      [
        "root merges a previous child",
        // input
        `- 1
         -- 1-1
         - 2`,
        // output
        `- 1 
         -- 1-1 2`,
        // id
        "2",
        // selection
        [0, 0]
      ]
    ];

    test.each(tests)(
      "%s",
      // @ts-ignore
      testStructure(mergePrevLine, mergePrevLineMock)
    );
  });

  describe("moveUp", () => {
    // mock
    const moveUpMock: Pick<TMoveUp, "type" | "store"> = {
      type: "moveUp",
      store
    };

    const tests = [
      [
        // no-change
        "first root",
        // input
        oneTwoThree,
        // output
        oneTwoThree,
        // id
        "1",
        // selection
        [0, 0]
      ],

      [
        "middle root",
        // input
        `- 1
         - 2
         - 3`,
        // output
        `- 2
         - 1
         - 3`,
        // id
        "2",
        // selection
        [0, 0]
      ],

      [
        "last root",
        // input
        `- 1
         - 2
         - 3`,
        // output
        `- 1
         - 3
         - 2`,
        // id
        "3",
        // selection
        [0, 0]
      ],

      [
        "first child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // output
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // id
        "1-1",
        // selection
        [0, 0]
      ],

      [
        "last child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // output
        `- 1
         -- 1-2
         -- 1-1
         - 2`,
        // id
        "1-2",
        // selection
        [0, 0]
      ],

      [
        "middle child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         -- 1-3
         - 2`,
        // output
        `- 1
         -- 1-2
         -- 1-1
         -- 1-3
         - 2`,
        // id
        "1-2",
        // selection
        [0, 0]
      ],

      [
        "over children",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2
         - 3`,
        // output
        `- 2
         - 1
         -- 1-1
         -- 1-2
         - 3`,
        // id
        "2",
        // selection
        [0, 0]
      ],

      [
        "with children",
        // input
        `- 1
         - 2
         -- 2-1
         -- 2-2
         - 3`,
        // output
        `- 2
         -- 2-1
         -- 2-2
         - 1
         - 3`,
        // id
        "2",
        // selection
        [0, 0]
      ]
    ];

    test.each(tests)(
      "%s",
      // @ts-ignore
      testStructure(moveUp, moveUpMock)
    );
  });

  describe("moveDown", () => {
    // mock
    const moveDownMock: Pick<TMoveDown, "type" | "store"> = {
      type: "moveDown",
      store
    };

    const tests = [
      [
        "first root",
        // input
        `- 1
         - 2
         - 3`,
        // output
        `- 2
         - 1
         - 3`,
        // id
        "1",
        // selection
        [0, 0]
      ],

      [
        "middle root",
        // input
        `- 1
         - 2
         - 3`,
        // output
        `- 1
         - 3
         - 2`,
        // id
        "2",
        // selection
        [0, 0]
      ],

      [
        // no-change
        "last root",
        // input
        oneTwoThree,
        // output
        oneTwoThree,
        // id
        "3",
        // selection
        [0, 0]
      ],

      [
        "first child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2`,
        // output
        `- 1
         -- 1-2
         -- 1-1
         - 2`,
        // id
        "1-1",
        // selection
        [0, 0]
      ],

      [
        "last child",
        // input
        `- 1
         -- 1-1
         - 2`,
        // output
        `- 1
         -- 1-1
         - 2`,
        // id
        "1-1",
        // selection
        [0, 0]
      ],

      [
        "middle child",
        // input
        `- 1
         -- 1-1
         -- 1-2
         -- 1-3
         - 2`,
        // output
        `- 1
         -- 1-1
         -- 1-3
         -- 1-2
         - 2`,
        // id
        "1-2",
        // selection
        [0, 0]
      ],

      [
        "over children",
        // input
        `- 1
         - 2
         -- 2-1
         -- 2-2
         - 3`,
        // output
        `- 2
         -- 2-1
         -- 2-2
         - 1
         - 3`,
        // id
        "1",
        // selection
        [0, 0]
      ],

      [
        "with children",
        // input
        `- 1
         -- 1-1
         -- 1-2
         - 2
         - 3`,
        // output
        `- 2
         - 1
         -- 1-1
         -- 1-2
         - 3`,
        // id
        "1",
        // selection
        [0, 0]
      ]
    ];

    test.each(tests)(
      "%s",
      // @ts-ignore
      testStructure(moveDown, moveDownMock)
    );
  });

  describe.skip("update", () => {
    // TODO
  });

  describe.skip("completed", () => {
    // TODO
  });

  describe.skip("undo", () => {
    // TODO
  });

  describe.skip("redo", () => {
    // TODO
  });
});

// HELPERS
// TODO support completed as `c` instead of `-`

export function factory(tasks: string): TTask[] {
  let previousRoot: TTaskID | undefined;
  let previousChild: TTaskID | undefined;
  const ret: TTask[] = [];
  tasks = normalize(tasks);

  for (let line of tasks.split("\n")) {
    const isChild = line.startsWith("--");
    if (isChild) {
      assert(previousRoot);
    }
    assert(!isChild || previousChild || previousRoot);
    const attrs: Partial<TTask> = isChild
      ? { parent: previousRoot, previous: previousChild }
      : { previous: previousRoot };
    const title = line.replace(/^-+ /, "");

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
    ret += task.parent ? "-- " : "- ";
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
    // always keep a space after a `-`
    ret += line.trim().replace(/^(--?)\s?/, "$1 ") + "\n";
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
