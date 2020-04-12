import assert from "assert";
import debug from "debug";
import {
  getNext,
  move,
  getVisiblePrevious,
  getSiblings,
  getTaskByID,
  getFirstChild,
  getChildren,
  createTask,
  now,
  TSelection,
  TTask,
  TTaskID,
  getVisibleNext,
  add,
} from "./model";
import { sortTasks } from "./sorting";
import Store from "./store";

const log = debug("canvas");

// types

export type TAction =
  | TUpdate
  | TNewline
  | TIndent
  | TOutdent
  | TUndo
  | TRedo
  | TMergePrevLine
  | TMoveUp
  | TMoveDown
  | TClearCompleted
  | TNewTask;

// per-task actions
export type TUpdate = {
  type: "update";
  title?: string;
  content?: string;
  duedate?: string;
  completed?: boolean;
} & TTaskActionBase;
export type TIndent = { type: "indent" } & TTaskActionBase;
export type TMoveUp = { type: "moveUp" } & TTaskActionBase;
export type TMoveDown = { type: "moveDown" } & TTaskActionBase;
export type TOutdent = { type: "outdent" } & TTaskActionBase;
export type TNewline = {
  type: "newline";
  setFocusedID(id: TTaskID): void;
  setSelection(selection: TSelection): void;
} & TTaskActionBase;
export type TMergePrevLine = {
  type: "mergePrevLine";
  setFocusedID(id: TTaskID): void;
  setSelection(selection: TSelection): void;
} & TTaskActionBase;
export type TClearCompleted = {
  type: "clearCompleted";
} & TTaskActionBase;
export type TNewTask = {
  type: "newTask";
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

export function reducer(state: TTask[], action: TAction): TTask[] {
  switch (action.type) {
    case "indent":
      return indent(state, action);
    case "mergePrevLine":
      return mergePrevLine(state, action);
    case "newline":
      return newline(state, action);
    case "outdent":
      return outdent(state, action);
    case "redo":
      return redo(state, action);
    case "undo":
      return undo(state, action);
    case "update":
      return update(state, action);
    case "moveUp":
      return moveUp(state, action);
    case "moveDown":
      return moveDown(state, action);
    case "clearCompleted":
      return clearCompleted(state, action);
  }
  return state;
}

export function update(tasks: TTask[], action: TUpdate): TTask[] {
  const task = getTaskByID(action.id, tasks);

  const newFields: Partial<TTask> = {};
  if (action.title !== undefined && task.title !== action.title) {
    newFields.title = action.title;
  }
  if (action.content !== undefined && task.content !== action.content) {
    newFields.content = action.content;
  }
  if (action.duedate !== undefined && task.duedate !== action.duedate) {
    newFields.duedate = action.duedate;
  }
  if (action.completed !== undefined && task.completed !== action.completed) {
    newFields.completed = action.completed;
    if (!action.completed) {
      // un-hide when un-completing
      newFields.hidden = false;
    }
  }

  if (!Object.keys(newFields).length) {
    return tasks;
  }

  // MODIFY

  for (const [field, val] of Object.entries(newFields)) {
    task[field] = val;
  }
  task.updated = now();

  log(`updated ${action.id}`, newFields);
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
    move(task.id, last.id, tasks);
  } else {
    move(task.id, undefined, tasks);
  }
  task.parent = newParent.id;
  task.updated = now();

  // merge children of the current task (if any)
  let position = task.position;
  for (const child of children) {
    child.position = ++position;
    child.parent = newParent.id;
    child.updated = now();
  }

  log(`indent ${action.id}`);
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

  // become the parent of next (visible) child siblings
  let previousID: TTaskID | undefined = undefined;
  for (const sibling of rightSiblings) {
    sibling.parent = task.id;
    sibling.updated = now();
    move(sibling.id, previousID, tasks);
    previousID = sibling.id;
  }

  // place after the old parent
  const parent = task.parent;
  task.parent = undefined;
  move(task.id, parent, tasks);
  task.updated = now();

  // link the next root task to this one or the last sibling (if any)
  if (nextOnRootLevel) {
    move(nextOnRootLevel.id, task.id, tasks);
  }

  log(`outdent ${action.id}`);
  const ret = sortTasks(tasks);
  action.store.set(ret, action.id, action.selection);
  return ret;
}

/**
 * Split a task into two on Enter key.
 *
 * TODO copy due date, completion etc to keep the sorting
 */
export function newline(tasks: TTask[], action: TNewline): TTask[] {
  const task = getTaskByID(action.id, tasks);

  const task1Title = task.title.slice(0, action.selection[0]).trim();
  const task2Title = task.title.slice(action.selection[1]).trim();

  log(`newline`, action.id);

  const newTask: TTask = createTask({ title: task2Title });

  // modify
  task.title = task1Title;
  task.updated = now();
  const hasChildren = getChildren(task.id, tasks).length;

  // root level parent task
  // place `task2` as the first child
  if (hasChildren) {
    const first = getFirstChild(task.id, tasks)!;
    assert(first);
    tasks.push(newTask);
    move(newTask.id, undefined, tasks);
  }
  // child task or a root level non-parent task
  else {
    newTask.parent = task.parent;
    add(newTask, task.id, tasks);
  }

  const ret = sortTasks(tasks);

  action.store.set(ret, action.id, action.selection);
  action.setFocusedID(newTask.id);
  action.setSelection([0, 0, false]);
  return ret;
}

// merges two tasks into one after Backspace on the line beginning
export function mergePrevLine(tasks: TTask[], action: TMergePrevLine): TTask[] {
  const { id } = action;
  const task = getTaskByID(id, tasks);
  let previous = getVisiblePrevious(id, tasks);

  // dont merge-up the first task
  if (!previous) {
    return tasks;
  }
  previous = previous!;
  log(`mergePrevLine`, id);

  // MODIFY

  previous.title += " " + task.title;
  previous.updated = now();

  action.setFocusedID(previous.id);
  // place the caret in between the merged titles
  const caret = previous.title.length - task.title.length - 1;
  action.setSelection([caret, caret, false]);

  move(id, undefined, tasks);
  tasks = tasks.filter((t: TTask) => t.id !== id);

  const ret = sortTasks(tasks);
  action.store.set(ret, id, action.selection);
  return ret;
}

export function undo(tasks: TTask[], action: TUndo): TTask[] {
  const rev = action.store.undo();
  // no more undos
  if (!rev) {
    return tasks;
  }

  const task = getTaskByID(rev.focusedID, rev.tasks);
  log("undo", task.title, rev.selection);

  // restore the focus
  action.setSelection(rev.selection);
  action.setFocusedID(rev.focusedID);
  // manually set the contentEditable
  action.setManualTaskTitle({ id: rev.focusedID, title: task.title });

  return rev.tasks;
}

export function redo(tasks: TTask[], action: TRedo): TTask[] {
  const rev = action.store.redo();
  // no more redos
  if (!rev) {
    return tasks;
  }

  const task = getTaskByID(rev.focusedID, tasks);
  log("redo", rev?.focusedID, rev?.selection);

  // restore the focus
  action.setSelection(rev.selection);
  action.setFocusedID(rev.focusedID);
  // manually set the contentEditable
  action.setManualTaskTitle({ id: rev.focusedID, title: task.title });

  return rev.tasks;
}

export function moveUp(tasks: TTask[], action: TMoveUp): TTask[] {
  const { id } = action;
  const task = getTaskByID(id, tasks);

  // already at the top
  if (!getVisiblePrevious(id, tasks, true)) {
    return tasks;
  }

  const previous = getVisiblePrevious(task.id, tasks, true);
  if (!previous) {
    return tasks;
  }
  const targetPrevious = getVisiblePrevious(previous.id, tasks, true);
  if (!targetPrevious) {
    return tasks;
  }

  // put above `targetPrevious`
  move(id, targetPrevious.id, tasks);

  log(`moveup`, task.id);
  const ret = sortTasks(tasks);
  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function moveDown(tasks: TTask[], action: TMoveDown): TTask[] {
  const { id } = action;
  const task = getTaskByID(id, tasks);
  const next = getVisibleNext(id, tasks, true);

  // already at the bottom
  if (!next) {
    return tasks;
  }

  // put under `next`
  move(task.id, next.id, tasks);

  log(`movedown`, task.id);
  const ret = sortTasks(tasks);
  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function clearCompleted(
  tasks: TTask[],
  action: TClearCompleted
): TTask[] {
  let changed = false;

  // MODIFY
  for (const task of tasks) {
    if (!task.completed) {
      continue;
    }
    task.hidden = true;
    task.updated = now();
    changed = true;
  }

  log("cleared completed tasks");
  const ret = sortTasks(tasks);
  action.store.set(ret, action.id, action.selection);
  return ret;
}
