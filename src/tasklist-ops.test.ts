import { TTask } from "./store";
import { sortTasks, now, isUserSorted } from "./tasklist-ops";
// @ts-ignore

describe("sorting", () => {
  describe("user", () => {
    const sorted: TTask[] = [
      createTask("1"),
      createTask("2", { parent: "1" }),
      createTask("3", { previous: "1" }),
      createTask("4", { previous: "3" })
    ];

    const unsorted: TTask[] = [
      createTask("2", { parent: "1" }),
      createTask("1"),
      createTask("3", { previous: "1" }),
      createTask("4", { previous: "3" })
    ];

    test("isUserSorted", () => {
      expect(isUserSorted(sorted)).toBeTruthy();
      expect(isUserSorted(unsorted)).toBeFalsy();
    });

    test("sortTasks", () => {
      expect(sortTasks(sorted)).toMatchObject(sorted);
      expect(sortTasks(unsorted)).toMatchObject(sorted);
    });
  });
});

// text is also an ID, has to be unique
function createTask(text: string, task?: Partial<TTask>): TTask {
  return {
    id: text,
    title: text,
    updated: now(),
    created: now(),
    previous: task?.previous || undefined,
    parent: task?.parent || undefined
  };
}
