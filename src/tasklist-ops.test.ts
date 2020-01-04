import { TTask } from "./store";
import { sortTasks, now, isUserSorted } from "./tasklist-ops";
// @ts-ignore
import deepcopy from "deepcopy";

describe("sorting", () => {
  describe("user", () => {
    const sorted: TTask[] = [
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
    ];

    test("isUserSorted", () => {
      expect(isUserSorted(sorted)).toBeTruthy();
      const unsorted = deepcopy(sorted);
      let tmp = unsorted[0];
      unsorted[0] = unsorted[1];
      unsorted[1] = tmp;
      expect(isUserSorted(sorted)).toBeFalsy();
    });
  });
});
