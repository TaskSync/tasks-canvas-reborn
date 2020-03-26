import assert from "assert";
import debug from "debug";
import { TTask, TTaskID, getChildren } from "./model";

const log = debug("canvas");

/**
 * Sorts tasks in the way they would be visible on the screen.
 *
 * Return a new array.
 *
 * TODO implement other types of sorting
 * TODO align with the new sorting
 */
export function sortTasks(
  tasks: TTask[],
  order: "user" | "created" | "updated" | "duedate" = "user"
): TTask[] {
  if (order === "user") {
    const sorted = [];

    for (const task of tasks) {
      // root tasks only
      if (task.parent) {
        continue;
      }
      sorted.push(task);
      const children = getChildren(task.id, tasks);
      if (!children.length) {
        continue;
      }
      sorted.push(...sortBranch(children));
    }
    assert(sorted.length === tasks.length, "missing tasks after sorting");
    return sorted;
  }

  // TODO ???
  return [...tasks];
}

/**
 * Return a new, sorted array.
 */
export function sortBranch(tasks: TTask[]): TTask[] {
  return [...tasks].sort((a: TTask, b: TTask) => {
    // TODO verify ASC DESC
    return a.position < b.position ? -1 : 1;
  });
}

export function isUserSorted(tasks: TTask[]): boolean {
  // TODO
  return true;
}
