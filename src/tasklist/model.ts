import assert from "assert";
import uniqid from "uniqid";

export type TTaskID = string;
export type TTask = {
  id: TTaskID;
  title: string;
  content?: string;
  // TODO
  // tasklist: TTaskListID;
  parent?: TTaskID;
  // user sorting
  previous?: TTaskID;
  // TODO iso date ?
  created: number;
  // TODO iso date ?
  updated: number;
  isCompleted?: boolean;
};
export type TRev = {
  tasks: TTask[];
  focusedID: string;
  selection: TSelection;
};
export type TSelection = [number, number];

export function getChildren(id: TTaskID, tasks: TTask[]): TTask[] {
  return tasks.filter(t => t.parent === id);
}

export function getFirstChild(id: TTaskID, tasks: TTask[]): TTask | null {
  return getChildren(id, tasks).find(t => t.previous === undefined) || null;
}

export function getTaskByID(id: TTaskID, tasks: TTask[]): TTask {
  const task = tasks.find(task => task.id === id);
  assert(task);
  return task!;
}

export function getSiblings(
  id: TTaskID,
  tasks: TTask[],
  direction: "both" | "right" | "left" = "both"
): TTask[] {
  const siblings: TTask[] = [];

  if (direction === "left" || direction === "both") {
    let sibling: TTask | null = getTaskByID(id, tasks);
    do {
      sibling = getVisiblePrevious(sibling!.id, tasks, true);
      if (sibling) {
        siblings.push(sibling);
      }
    } while (sibling);
  }

  if (direction === "right" || direction === "both") {
    let sibling: TTask | null = getTaskByID(id, tasks);
    do {
      sibling = getVisibleNext(sibling!.id, tasks, true);
      if (sibling) {
        siblings.push(sibling);
      }
    } while (sibling);
  }

  return siblings;
}

/**
 * Returns the previous visible task on the list.
 *
 * Different then user-sorting previous (task.previous).
 */
export function getVisiblePrevious(
  id: TTaskID,
  tasks: TTask[],
  sameLevel = false
): TTask | null {
  const task = getTaskByID(id, tasks);
  let index = tasks.indexOf(task);
  index--;
  while (index !== -1) {
    const previous = tasks[index];
    // check the depth
    if (sameLevel && previous.parent === task.parent) {
      return previous;
    } else if (!sameLevel) {
      return previous;
    }
    index--;
  }
  return null;
}

export function getVisibleNext(
  id: TTaskID,
  tasks: TTask[],
  sameLevel = false
): TTask | null {
  const task = getTaskByID(id, tasks);
  let index = tasks.indexOf(task);
  index++;
  while (index < tasks.length) {
    const previous = tasks[index];
    // check the depth
    if (sameLevel && previous.parent === task.parent) {
      return previous;
    } else if (!sameLevel) {
      return previous;
    }
    index++;
  }
  return null;
}

/**
 * Set a new previous for a task and update the old `next`.
 */
export function setPrevious(
  id: TTaskID,
  previous: TTaskID | undefined,
  tasks: TTask[]
) {
  const task = getTaskByID(id, tasks);
  const next = getNext(id, tasks);

  // keep the left-linked list consistent
  if (next) {
    next.previous = task.previous;
  }
  task.previous = previous;
}

/**
 * Returns the task pointing to ID as the previous one (if any).
 *
 * User sorting, not the currently visible order.
 */
export function getNext(id: TTaskID, tasks: TTask[]): TTask | null {
  const next = tasks.find(task => task.previous === id);
  return next || null;
}

// TODO iso date?
export function now(): number {
  return Date.now();
}

export function createTask(task: Partial<TTask> = {}): TTask {
  const defaults = {
    id: uniqid(),
    title: "",
    created: now(),
    updated: now()
  };
  return {
    ...defaults,
    ...task
  };
}
