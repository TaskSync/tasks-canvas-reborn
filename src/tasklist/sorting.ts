import assert from "assert";
import { TTask, getChildren, getRootTasks } from "./model";

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

    const rootTasks = sortBranch(getRootTasks(tasks));

    for (const task of rootTasks) {
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

  return [...tasks];
}

/**
 * Return a new, sorted array.
 */
export function sortBranch(tasks: TTask[]): TTask[] {
  return [...tasks].sort((a: TTask, b: TTask) => {
    return a.position < b.position ? -1 : 1;
  });
}
