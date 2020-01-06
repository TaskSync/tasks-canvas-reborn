import assert from "assert";
import debug from "debug";
import { TTask, TTaskID } from "./model";

const log = debug("canvas");

/**
 * Sorts and returns a new array.
 *
 * TODO implement other types of sorting
 *   may cause unexpected results with various actions bc of the positions
 */
export function sortTasks(
  tasks: TTask[],
  order: "user" | "created" | "updated" | "duedate" = "user"
): TTask[] {
  // TODO optimize (aka the worst soring ever made)
  if (order === "user") {
    if (isUserSorted(tasks)) {
      return [...tasks];
    }
    log("sorting by user");

    // find the first task
    let first: TTask | undefined = tasks.find(
      (t: TTask) => !t.previous && !t.parent
    );
    assert(first);
    first = first!;

    // sort by looking for the next task
    const sorted: TTask[] = [first];
    let previousOnRootLevel: TTaskID = first.id;
    for (let i = 0; i < tasks.length - 1; i++) {
      // start from the last sorted one
      const task = sorted[i];
      let next: TTask | undefined;

      // first child
      if (!task.parent) {
        next = tasks.find((t: TTask) => t.parent === task.id && !t.previous);
      }
      // next child sibling
      else {
        next = tasks.find(
          (t: TTask) => t.parent === task.parent && t.previous === task.id
        );
      }

      // next root sibling
      if (!next && previousOnRootLevel) {
        next = tasks.find(
          (t: TTask) => !t.parent && t.previous === previousOnRootLevel
        );
      }

      assert(next);
      next = next!;

      sorted.push(next);
      if (!next.parent) {
        previousOnRootLevel = next.id;
      }
    }
    assert(sorted.length === tasks.length, "missing tasks after sorting");
    return sorted;
  }
  return [...tasks];
}

// TODO should be TRUE for action.type === update
export function isUserSorted(tasks: TTask[]): boolean {
  if (!tasks.length) {
    return true;
  }
  if (tasks[0].parent || tasks[0].previous) {
    return false;
  }
  let previous: TTask = tasks[0];
  let previousOnRootLevel: TTask = tasks[0];
  for (let i = 1; i < tasks.length; i++) {
    const task = tasks[i];

    // parent mismatch
    if (previous.parent && task.parent && task.parent !== previous.parent) {
      return false;
    }
    // linked list mismatch (when the same parent)
    if (task.previous !== previous.id && task.parent === previous.parent) {
      return false;
    }
    // first child shouldnt have a `previous`
    if (task.parent && !previous.parent && task.previous) {
      return false;
    }
    // after the last child, check `previous`
    if (
      !task.parent &&
      previous.parent &&
      task.previous !== previousOnRootLevel.id
    ) {
      return false;
    }

    previous = task;
    if (!task.parent) {
      previousOnRootLevel = task;
    }
  }
  return true;
}
