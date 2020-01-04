import assert from "assert";
import { remove } from "lodash";
import uniqid from "uniqid";
import Store, { TSelection, TTask, TTaskID, now } from "./store";

// types

export type TAction =
  | TUpdate
  | TNewline
  | TIndent
  | TCompleted
  | TOutdent
  | TUndo
  | TRedo
  | TMergePrevLine;

// per-task actions
export type TUpdate = {
  type: "update";
  id: string;
  title: string;
} & TTaskActionBase;
export type TIndent = { type: "indent" } & TTaskActionBase;
export type TOutdent = { type: "outdent" } & TTaskActionBase;
export type TCompleted = {
  type: "completed";
  completed: boolean;
} & TTaskActionBase;
export type TNewline = {
  type: "newline";
  id: string;
  setFocusedID(id: TTaskID): void;
  setSelection(selection: TSelection): void;
} & TTaskActionBase;
export type TMergePrevLine = {
  type: "mergePrevLine";
  id: string;
  setFocusedID(id: TTaskID): void;
  setSelection(selection: TSelection): void;
} & TTaskActionBase;
type TTaskActionBase = {
  store: Store;
  id: TTaskID;
  selection: TSelection;
};

// undo actions
export type TUndo = {
  type: "undo";
} & TUndoBase;
export type TRedo = {
  type: "redo";
} & TUndoBase;
export type TUndoBase = {
  setFocusedID(id: TTaskID): void;
  setSelection(selection: TSelection): void;
  setManualTaskTitle({ id, title }: { id: TTaskID; title: string }): void;
  store: Store;
};

// TODO bump the updated field on every action

export function update(tasks: TTask[], action: TUpdate): TTask[] {
  let task = tasks.find(task => task.id === action.id);
  assert(task);
  task = task!;
  if (task.title === action.title) {
    return tasks;
  }

  // modify
  task.title = action.title;
  task.updated = now();

  console.log(`updated ${action.id} with`, task.title);
  const ret = sortTasks(tasks);
  action.store.set(ret, action.id, action.selection);
  return ret;
}

// TODO only in user-order sorting
export function indent(tasks: TTask[], action: TIndent): TTask[] {
  const task = getTaskByID(action.id, tasks);

  // dont indent children
  if (task.parent) {
    return tasks;
  }

  const newParent = getVisiblePrevious(action.id, tasks, true);

  // cant indent the first one on the list
  if (!newParent) {
    return tasks;
  }

  const previousChildren = getChildren(newParent.id, tasks);
  const children = getChildren(task.id, tasks);

  // MODIFY

  // place after the last child of the previous one
  if (previousChildren.length) {
    const last = previousChildren[previousChildren.length - 1];
    setPrevious(task.id, tasks, last.id);
  } else {
    setPrevious(task.id, tasks, undefined);
  }
  task.parent = newParent.id;
  task.updated = now();

  // merge children of the current task (if any)
  let firstChild = true;
  for (const child of children) {
    if (firstChild) {
      child.previous = task.id;
      firstChild = false
    }
    child.parent = newParent.id;
  }

  console.log(`indent ${action.id}`);
  const ret = sortTasks(tasks);
  action.store.set(ret, action.id, action.selection);
  return ret;
}

// TODO only in user-order sorting
export function outdent(tasks: TTask[], action: TOutdent): TTask[] {
  const task = getTaskByID(action.id, tasks);

  // dont outdent children
  if (!task.parent) {
    return tasks;
  }

  const rightSiblings = getSiblings(task.id, tasks, 'right')
  const nextOnRootLevel = getNext(task.parent, tasks);

  // MODIFY

  // outdent next (visible) child siblings
  let lastSibling;
  for (const sibling of rightSiblings) {
    sibling.parent = undefined
    sibling.updated = now()
    lastSibling = sibling
  }

  // place after the old parent
  task.previous = task.parent;
  task.parent = undefined;
  task.updated = now();

  // link the next root task to this one or the last sibling (if any)
  if (nextOnRootLevel) {
    nextOnRootLevel.previous = lastSibling?.id || task.id;
  }

  console.log(`outdent ${action.id}`);
  const ret = sortTasks(tasks);
  action.store.set(ret, action.id, action.selection);
  return ret;
}

//
/**
 * Split a task into two on Enter key.
 *
 * TODO copy due date, completion etc to keep the sorting
 */
export function newline(tasks: TTask[], action: TNewline): TTask[] {
  const task = getTaskByID(action.id, tasks);

  const task1Title = task.title.slice(0, action.selection[0]);
  const task2Title = task.title.slice(action.selection[1]);

  console.log(`newline`, action.id);

  // TODO extract the factory
  const task2: TTask = {
    id: uniqid(),
    title: task2Title,
    parent: undefined,
    previous: undefined,
    created: now(),
    updated: now()
  };

  // modify
  task.title = task1Title;
  const hasChildren = getChildren(task.id, tasks).length;

  // root level parent task
  // place `task2` as the first child
  if (hasChildren) {
    const first = getFirstChild(task.id, tasks)!;
    assert(first);
    first.previous = task2.id;
  }
  // child task or a root level non-parent task
  else {
    const nextSibling = getNext(task.id, tasks);
    // modify AFTER the lookup
    task2.parent = task.parent;
    task2.previous = task.id;
    if (nextSibling) {
      nextSibling.previous = task2.id;
    }
  }

  tasks.push(task2);
  const ret = sortTasks(tasks);

  action.store.set(ret, action.id, action.selection);
  action.setFocusedID(task2.id);
  action.setSelection([0, 0]);
  return ret;
}

// merges two tasks into one after Backspace on the line beginning
export function mergePrevLine(tasks: TTask[], action: TNewline): TTask[] {
  const taskToDelete = getTaskByID(action.id, tasks);

  const indexToDelete = tasks.indexOf(taskToDelete);
  // dont merge-up the first task
  if (indexToDelete === 0) {
    return tasks;
  }

  // modify
  console.log(`mergePrevLine`, taskToDelete, indexToDelete);

  const previous = tasks[indexToDelete - 1];
  previous.title += " " + taskToDelete.title;

  action.setFocusedID(previous.id);
  // place the caret in between the merged titles
  const caret = previous.title.length - taskToDelete.title.length - 1;
  action.setSelection([caret, caret]);

  tasks = remove(tasks, (t: TTask) => t.id === taskToDelete.id);
  const ret = sortTasks(tasks);

  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function completed(tasks: TTask[], action: TCompleted): TTask[] {
  const task = getTaskByID(action.id, tasks);

  // modify
  task.isCompleted = action.completed;

  console.log(`completed`, task.id, action.completed);
  const ret = sortTasks(tasks);
  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function undo(tasks: TTask[], action: TUndo): TTask[] {
  const rev = action.store.undo();
  // no more undos
  if (!rev) {
    return tasks;
  }

  let task = rev.tasks.find(t => t.id === rev.focusedID);
  assert(task);
  task = task!;
  console.log("undo", task.title, rev.selection);

  // restore the focus
  action.setSelection(rev.selection);
  action.setFocusedID(rev.focusedID);
  // manually set the contentEditable
  action.setManualTaskTitle({ id: rev.focusedID, title: task.title });

  return rev.tasks;
}

export function redo(tasks: TTask[], action: TUndo): TTask[] {
  const rev = action.store.redo();
  // no more redos
  if (!rev) {
    return tasks;
  }

  let task = rev.tasks.find(t => t.id === rev.focusedID);
  assert(task);
  task = task!;
  console.log("redo", rev?.focusedID, rev?.selection);

  // restore the focus
  action.setSelection(rev.selection);
  action.setFocusedID(rev.focusedID);
  // manually set the contentEditable
  action.setManualTaskTitle({ id: rev.focusedID, title: task.title });

  return rev.tasks;
}

// helper functions

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
    console.log("sorting by user");

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

// HELPERS

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

function getSiblings(
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
  tasks: TTask[],
  previous: TTaskID | undefined
) {
  const task = getTaskByID(id, tasks);
  const next = getNext(id, tasks);
  // keep the one-way-linked-list consistent
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
