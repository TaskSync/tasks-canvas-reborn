import assert from "assert";
import uniqid from "uniqid";
import { sortBranch } from "./sorting";

export type TTaskID = string;
export type TTask = {
  id: TTaskID;
  title: string;
  content: string;
  // TODO
  // tasklist: TTaskListID;
  duedate: string;
  parent?: TTaskID;
  // user sorting
  position: number;
  // TODO iso date ?
  created: number;
  // TODO iso date ?
  updated: number;
  completed?: boolean;
  hidden?: boolean;
};
export type TRev = {
  tasks: TTask[];
  focusedID: string;
  selection: TSelection;
};

// start, end, isBackwards
// TODO make it an object
export type TSelection = [number, number, boolean];

export function getRootTasks(tasks: TTask[]): TTask[] {
  return tasks.filter(t => t.parent === undefined);
}

export function getChildren(id: TTaskID, tasks: TTask[]): TTask[] {
  return tasks.filter(t => t.parent === id);
}

export function getFirstChild(id: TTaskID, tasks: TTask[]): TTask | null {
  const children = getChildren(id, tasks);
  return (
    children.reduce((prev, task) => {
      return prev?.position < task.position ? prev : task;
    }) || null
  );
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
 *
 * TODO how many steps (eg 2-nd previous)
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
 *
 * TODO include in the sync write in taskbot-engine
 *   should trigged a "move" cmd for each affected task
 */
export function move(
  id: TTaskID,
  previousID: TTaskID | undefined,
  tasks: TTask[]
): void {
  debugger;
  const task = getTaskByID(id, tasks);
  const toMove = previousID
    ? getSiblings(previousID, tasks, "right")
    : getRootTasks(tasks);

  for (const task of toMove) {
    task.position++;
  }

  task.position = previousID ? getTaskByID(previousID, tasks).position + 1 : 0;
}

/**
 * Add a new task at a specified position.
 */
export function add(
  newTask: TTask,
  previousID: TTaskID | undefined,
  tasks: TTask[]
): void {
  const toMove = previousID
    ? getSiblings(previousID, tasks, "right")
    : getRootTasks(tasks);

  for (const task of toMove) {
    task.position++;
  }

  newTask.position = previousID
    ? getTaskByID(previousID, tasks).position + 1
    : 0;

  tasks.push(newTask);
}

/**
 * Returns the task pointing to ID as the previous one (if any).
 *
 * User sorting, not the currently visible order.
 *
 * TODO align with new sorting
 */
export function getNext(id: TTaskID, tasks: TTask[]): TTask | null {
  const siblings = sortBranch(getSiblings(id, tasks));

  return (
    siblings.reduce((prev, task) => {
      return prev?.position < task.position ? prev : task;
    }) || null
  );
}

// TODO iso date?
export function now(): number {
  return Date.now();
}

export function createTask(task: Partial<TTask> = {}): TTask {
  const defaults = {
    id: uniqid(),
    title: "",
    content: "",
    duedate: "",
    created: now(),
    updated: now(),
    position: 0
  };
  return {
    ...defaults,
    ...task
  };
}
