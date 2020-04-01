import { move, add } from "./model";
import { t } from "./test-utils";

describe("models", () => {
  test.todo("getNext");
  test.todo("move");

  test("move", () => {
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

  test("add", () => {
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
});
