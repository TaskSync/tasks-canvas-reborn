import { move, add } from "./model";
import { t } from "./test-utils";

describe("models", () => {
  test.todo("getNext");
  test.todo("move");

  describe("move", () => {
    test("root level", () => {
      const tasks = [
        // 1
        t("1", { position: 1 }),
        // 2
        t("2", { position: 2 }),
        // 3
        t("3", { position: 3 })
      ];
      move(tasks[2].id, "1", tasks);
      expect(tasks).toMatchObject([
        { id: "1", position: 1 },
        { id: "2", position: 3 },
        { id: "3", position: 2 }
      ]);
    });

    test("child task", () => {
      const tasks = [
        // 1
        t("1", { position: 1 }),
        // 2
        t("2", { position: 2 }),
        // 3
        t("3", { position: 3 })
      ];
      tasks[1].parent = "1";
      move(tasks[1].id, undefined, tasks);
      expect(tasks).toMatchObject([
        { id: "1", position: 1 },
        { id: "3", position: 3 },
        { id: "2", position: 0, parent: "1" }
      ]);
    });

    test("second child task", () => {
      const tasks = [
        // 1
        t("1", { position: 1 }),
        // 1
        t("1-1", { position: 1, parent: "1" }),
        // 2
        t("2", { position: 2 }),
        // 3
        t("3", { position: 3 })
      ];
      tasks[2].parent = "1";
      move(tasks[2].id, tasks[1].id, tasks);
      expect(tasks).toMatchObject([
        { id: "1", position: 1 },
        { id: "1-1", position: 1, parent: "1" },
        { id: "3", position: 3 },
        { id: "2", position: 2, parent: "1" }
      ]);
    });
  });

  describe("add", () => {
    test("root task", () => {
      const newTask = t("new");
      const tasks = [
        // 1
        t("1", { position: 1 }),
        // 2
        t("2", { position: 2 })
      ];
      add(newTask, "1", tasks);
      expect(tasks).toMatchObject([
        { id: "1", position: 1 },
        { id: "2", position: 3 },
        { id: "new", position: 2 }
      ]);
    });

    test("child task", () => {
      const newTask = t("new", { parent: "1" });
      const tasks = [
        // 1
        t("1", { position: 1 }),
        // 2
        t("2", { position: 2 })
      ];
      add(newTask, undefined, tasks);
      expect(tasks).toMatchObject([
        { id: "1", position: 1 },
        { id: "2", position: 2 },
        { id: "new", position: 0, parent: "1" }
      ]);
    });

    test("second child task", () => {
      const newTask = t("new", { parent: "1" });
      const tasks = [
        // 1
        t("1", { position: 1 }),
        // 1
        t("1-1", { position: 1, parent: "1" }),
        // 2
        t("2", { position: 2 })
      ];
      add(newTask, "1-1", tasks);
      expect(tasks).toMatchObject([
        { id: "1", position: 1 },
        { id: "1-1", position: 1, parent: "1" },
        { id: "2", position: 2 },
        { id: "new", position: 2, parent: "1" }
      ]);
    });
  });
});
