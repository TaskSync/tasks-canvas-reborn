import { TTask } from "./model";
import { sortTasks } from "./sorting";
import { t } from "./test-utils";

describe("sorting", () => {
  describe("user", () => {
    test("nested", () => {
      const unsorted: TTask[] = [
        t("1", { position: 1 }),
        /**/ t("1-1", { position: 1, parent: "1" }),
        t("2", { position: 2 }),
        t("3", { position: 3 }),
        /**/ t("1-2", { position: 2, parent: "1" })
      ];

      const sorted: TTask[] = [
        t("1", { position: 1 }),
        /**/ t("1-1", { position: 1, parent: "1" }),
        /**/ t("1-2", { position: 2, parent: "1" }),
        t("2", { position: 2 }),
        t("3", { position: 3 })
      ];
      expect(sortTasks(unsorted)).toMatchObject(sorted);
    });

    test("root level", () => {
      const unsorted: TTask[] = [
        t("2", { position: 2 }),
        t("3", { position: 3 }),
        t("1", { position: 1 })
      ];

      const sorted: TTask[] = [
        t("1", { position: 1 }),
        t("2", { position: 2 }),
        t("3", { position: 3 })
      ];
      expect(sortTasks(unsorted)).toMatchObject(sorted);
    });
  });
});
