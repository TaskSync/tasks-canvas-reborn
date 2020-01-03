// import { map } from "lodash-es";
import assert from "assert";
import uniqid from "uniqid";
import Store, { TSelection, TTask, TTaskID } from "./store";

// types

export type TAction =
  | TUpdate
  | TNewline
  | TIndent
  | TCompleted
  | TUnIndent
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
export type TUnIndent = { type: "outdent" } & TTaskActionBase;
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

// TODO update the timestamp

export function update(tasks: TTask[], action: TUpdate): TTask[] {
  let task = tasks.find(task => task.id === action.id);
  assert(task);
  task = task!;
  if (task.title === action.title) {
    return tasks;
  }

  // modify
  task.title = action.title;
  console.log(`updated ${action.id} with`, task.title);
  const ret = [...tasks];
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
  const ret = [...tasks];
  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function unindent(tasks: TTask[], action: TUnIndent): TTask[] {
  let task = tasks.find(task => task.id === action.id);
  assert(task);
  task = task!;

  // modify
  task.parent = undefined;
  console.log(`unindent ${action.id}`);
  // TODO unindent next siblings
  const ret = [...tasks];
  action.store.set(ret, action.id, action.selection);
  return ret;
}

// splits a task to two on Enter key
export function newline(tasks: TTask[], action: TNewline): TTask[] {
  let task = tasks.find(task => task.id === action.id);
  assert(task);
  task = task!;

  // modify
  const index = tasks.indexOf(task);
  const task1Title = task.title.slice(0, action.selection[0]);
  const task2Title = task.title.slice(action.selection[1]);

  console.log(`newline`, action.id);
  task.title = task1Title;
  // TODO extract the factory
  // TODO setPrevious()
  const task2: TTask = {
    id: uniqid(),
    title: task2Title,
    parent: task.parent
      ? task.parent
      : getChildren(task.id, tasks).length
      ? task.id
      : undefined,
    created: Date.now(),
    updated: {
      canvas: Date.now()
    }
  };
  // TODO set previous to the next task
  const ret = [...tasks.slice(0, index + 1), task2, ...tasks.slice(index + 1)];

  action.store.set(ret, action.id, action.selection);
  action.setFocusedID(task2.id);
  action.setSelection([0, 0]);
  return ret;
}

// merges two tasks into one after Backspace on the line beginning
export function mergePrevLine(tasks: TTask[], action: TNewline): TTask[] {
  let taskToDelete = tasks.find(task => task.id === action.id);
  assert(taskToDelete);
  taskToDelete = taskToDelete!;

  // modify
  const indexToDelete = tasks.indexOf(taskToDelete);
  console.log(`mergePrevLine`, taskToDelete, indexToDelete);
  // dont merge-up the first task
  if (indexToDelete === 0) {
    return tasks;
  }

  const previous = tasks[indexToDelete - 1];
  previous.title += " " + taskToDelete.title;

  action.setFocusedID(previous.id);
  // place the caret in between the merged titles
  const caret = previous.title.length - taskToDelete.title.length - 1;
  action.setSelection([caret, caret]);

  const ret = [
    ...tasks.slice(0, indexToDelete),
    ...tasks.slice(indexToDelete + 1)
  ];

  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function completed(tasks: TTask[], action: TCompleted): TTask[] {
  let task = tasks.find(task => task.id === action.id);
  assert(task);

  // modify
  task = task!;
  task.isCompleted = action.completed;
  const ret = [...tasks];
  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function undo(tasks: TTask[], action: TUndo): TTask[] {
  // debugger
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

export function sort(tasks: TTask[], order: "created" | "updated" | "user") {}

export function getChildren(id: TTaskID, tasks: TTask[]): TTask[] {
  return tasks.filter(t => t.parent === id);
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
