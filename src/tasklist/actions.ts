import assert from "assert";
import { remove } from "lodash";
import uniqid from "uniqid";
import {
  getNext,
  setPrevious,
  getVisiblePrevious,
  getSiblings,
  getTaskByID,
  getFirstChild,
  getChildren
} from "./actions-helpers";
import { sortTasks } from "./sorting";
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
      firstChild = false;
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

  const rightSiblings = getSiblings(task.id, tasks, "right");
  const nextOnRootLevel = getNext(task.parent, tasks);

  // MODIFY

  // outdent next (visible) child siblings
  let lastSibling;
  for (const sibling of rightSiblings) {
    sibling.parent = undefined;
    sibling.updated = now();
    lastSibling = sibling;
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
