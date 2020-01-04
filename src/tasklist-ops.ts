import { remove } from "lodash";
import assert from "assert";
import uniqid from "uniqid";
import Store, { TSelection, TTask, TTaskID } from "./store";

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

export function indent(tasks: TTask[], action: TIndent): TTask[] {
  const task = getTaskByID(action.id, tasks);

  // dont indent children
  if (task.parent) {
    return tasks;
  }

  const previousOnRootDepth = getVisiblePrevious(action.id, tasks, true);

  // cant indent the first one on the list
  if (!previousOnRootDepth) {
    return tasks;
  }

  // modify

  // place after the last child of the previous one
  const children = getChildren(previousOnRootDepth.id, tasks);
  if (children.length) {
    const last = children[children.length - 1];
    setPrevious(task.id, tasks, last.id);
  } else {
    setPrevious(task.id, tasks, undefined);
  }
  task.parent = previousOnRootDepth.id;

  console.log(`indent ${action.id}`);
  const ret = sortTasks(tasks);
  console.log(ret);
  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function outdent(tasks: TTask[], action: TOutdent): TTask[] {
  const task = getTaskByID(action.id, tasks);

  // dont outdent children
  if (!task.parent) {
    return tasks;
  }

  // modify

  // outdent next (visible) child siblings
  let nextSibling;
  do {
    // TODO fix user-order for all siblings being moved here (when sorted)
    nextSibling = getVisibleNext(action.id, tasks);
    if (!nextSibling || nextSibling.parent !== task.parent) {
      break;
    }
    nextSibling.parent = undefined;
  } while (nextSibling);

  // link the siblings
  const nextOnRootLevel = getNext(task.parent, tasks);

  // place after the old parent
  task.parent = undefined;
  setPrevious(task.id, tasks, task.parent);
  if (nextOnRootLevel) {
    setPrevious(
      nextOnRootLevel.id,
      tasks,
      // link the next root task to this one or the last sibling
      (nextSibling && nextSibling.id) || task.id
    );
  }

  console.log(`outdent ${action.id}`);
  const ret = sortTasks(tasks);
  console.log(ret);
  action.store.set(ret, action.id, action.selection);
  return ret;
}

// splits a task into two on Enter key
export function newline(tasks: TTask[], action: TNewline): TTask[] {
  const task = getTaskByID(action.id, tasks);

  const task1Title = task.title.slice(0, action.selection[0]);
  const task2Title = task.title.slice(action.selection[1]);

  console.log(`newline`, action.id);
  task.title = task1Title;

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

  // place the new task
  // - after the initial one (when no children)
  // - as a first child (in case of children)
  if (task.parent) {
    task2.parent = task.parent;
    task2.previous = task.id;
    const nextSibling = getNext(task.id, tasks);
    if (nextSibling) {
      nextSibling.previous = task2.id;
    }
  } else if (getChildren(task.id, tasks).length) {
    const first = getFirstChild(task.id, tasks)!;
    assert(first);
    first.previous = task2.id;
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
 * Always returns a new array.
 */
export function sortTasks(
  tasks: TTask[],
  order: "user" | "created" | "updated" | "duedate" = "user"
): TTask[] {
  // TODO implement
  //  may cause unexpected results with various actions bc of the positions
  if (order === "user") {
    if (isUserSorted(tasks)) {
      return [...tasks];
    }
    console.log("sorting by user");
    // TODO optimize
    // build a map
    const prevToPos = {};
    let root: TTask | undefined;
    for (let i = 0; i < tasks.length; i++) {
      let task = tasks[i];
      prevToPos[task.id] = i;
      if (!task.previous && !task.parent) {
        assert(!root);
        root = task;
      }
    }
    assert(root);
    root = root!;
    // sort
    const sorted: TTask[] = [root];
    let previousOnRootLevel = root;
    for (let i = 0; i < tasks.length - 1; i++) {
      const task = sorted[0];
      let next = tasks.find(
        (t: TTask) =>
          !sorted.includes(t) &&
          // simply linked
          (t.previous === task.id ||
            // first child
            (t.parent === task.id && !t.previous) ||
            // back to the root level
            t.previous === previousOnRootLevel.id)
      );
      assert(next);
      next = next!;
      sorted.push(next);
      if (!next.parent) {
        previousOnRootLevel = next;
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

/**
 * Returns the previous visible task on the list.
 *
 * Different then user-sorting previous (task.previous).
 */
export function getVisiblePrevious(
  id: TTaskID,
  tasks: TTask[],
  sameDepth = false
): TTask | null {
  const task = getTaskByID(id, tasks);
  let index = tasks.indexOf(task);
  index--;
  while (index !== -1) {
    const previous = tasks[index];
    // check the depth
    if (sameDepth && previous.parent === task.parent) {
      return previous;
    } else if (!sameDepth) {
      return previous;
    }
    index--;
  }
  return null;
}

export function getVisibleNext(
  id: TTaskID,
  tasks: TTask[],
  sameDepth = false
): TTask | null {
  const task = getTaskByID(id, tasks);
  let index = tasks.indexOf(task);
  index++;
  while (index !== tasks.length - 1) {
    const previous = tasks[index];
    // check the depth
    if (sameDepth && previous.parent === task.parent) {
      return previous;
    } else if (!sameDepth) {
      return previous;
    }
    index++;
  }
  return null;
}

/**
 * Set a new previous for a task and update the old `next`.
 * @param id
 * @param tasks
 * @param previous
 */
export function setPrevious(
  id: TTaskID,
  tasks: TTask[],
  previous: TTaskID | undefined
) {
  const task = getTaskByID(id, tasks);
  const next = getNext(id, tasks);
  if (!next) {
    return;
  }
  // keep the one-way-linked-list consistent
  next.previous = task.previous;
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

export function now(): number {
  return Date.now();
}
