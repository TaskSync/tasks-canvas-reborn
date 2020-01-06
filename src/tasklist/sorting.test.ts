import { now, TTask } from "./model";
import { isUserSorted, sortTasks } from "./sorting";

describe("sorting", () => {
  describe("user", () => {
    const sorted: TTask[] = [
      t("1"),
      t("1-1", { parent: "1" }),
      t("2", { previous: "1" }),
      t("3", { previous: "2" })
    ];

    const unsorted: TTask[] = [
      t("1-1", { parent: "1" }),
      t("1"),
      t("2", { previous: "1" }),
      t("3", { previous: "2" })
    ];

    test("isUserSorted", () => {
      expect(isUserSorted(sorted)).toBeTruthy();
      expect(isUserSorted(unsorted)).toBeFalsy();
    });

    test("sortTasks", () => {
      expect(sortTasks(sorted)).toMatchObject(sorted);
      expect(sortTasks(unsorted)).toMatchObject(sorted);
    });

    test("indent", () => {
      const unsorted: TTask[] = [
        t("1"),
        t("1-1", { parent: "1" }),
        t("2", { previous: "1" }),
        t("3", { previous: "2" }),
        t("1-2", { previous: "1-1", parent: "1" })
      ];
      const sorted: TTask[] = [
        t("1"),
        t("1-1", { parent: "1" }),
        t("1-2", { previous: "1-1", parent: "1" }),
        t("2", { previous: "1" }),
        t("3", { previous: "2" })
      ];
      expect(sortTasks(unsorted)).toMatchObject(sorted);
    });
  });
});

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
