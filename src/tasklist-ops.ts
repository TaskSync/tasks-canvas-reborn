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

export function update(state: TTask[], action: TUpdate): TTask[] {
  let task = state.find(task => task.id === action.id);
  assert(task);
  task = task!;
  if (task.title === action.title) {
    return state;
  }

  // modify
  task.title = action.title;
  console.log(`updated ${action.id} with`, task.title);
  const ret = [...state];
  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function indent(state: TTask[], action: TIndent): TTask[] {
  let task = state.find(task => task.id === action.id);
  assert(task);
  task = task!;
  const index = state.indexOf(task);
  if (index < 1) {
    return state;
  }

  // modify
  // TODO getPrevious(...)
  const previous = state[index - 1];
  // nest under the previous or inherit the parentID from it
  task.parentID = previous.parentID || previous.id;
  for (const child of getChildren(task.id, state)) {
    child.parentID = task.parentID;
  }
  console.log(`indent ${action.id}`);
  const ret = [...state];
  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function unindent(state: TTask[], action: TUnIndent): TTask[] {
  let task = state.find(task => task.id === action.id);
  assert(task);
  task = task!;

  // modify
  task.parentID = undefined;
  console.log(`unindent ${action.id}`);
  // TODO unindent next siblings
  const ret = [...state];
  action.store.set(ret, action.id, action.selection);
  return ret;
}

// splits a task to two on Enter key
export function newline(state: TTask[], action: TNewline): TTask[] {
  let task = state.find(task => task.id === action.id);
  assert(task);
  task = task!;

  // modify
  const index = state.indexOf(task);
  const task1Title = task.title.slice(0, action.selection);
  const task2Title = task.title.slice(action.selection);

  console.log(`newline`, action.id);
  task.title = task1Title;
  // TODO extract the factory
  const task2: TTask = {
    id: uniqid(),
    title: task2Title,
    parentID: task.parentID,
    created: Date.now(),
    updated: {
      canvas: Date.now()
    }
  };
  // TODO set previous to the next task
  const ret = [...state.slice(0, index + 1), task2, ...state.slice(index + 1)];

  action.store.set(ret, action.id, action.selection);
  action.setFocusedID(task2.id);
  action.setSelection([0, 0]);
  return ret;
}

// merges two tasks into one after Backspace on the line beginning
export function mergePrevLine(state: TTask[], action: TNewline): TTask[] {
  let taskToDelete = state.find(task => task.id === action.id);
  assert(taskToDelete);
  taskToDelete = taskToDelete!;

  // modify
  const indexToDelete = state.indexOf(taskToDelete);
  console.log(`mergePrevLine`, taskToDelete, indexToDelete);
  // dont merge-up the first task
  if (indexToDelete === 0) {
    return state;
  }

  const previous = state[indexToDelete - 1];
  previous.title += " " + taskToDelete.title;

  action.setFocusedID(previous.id);
  // place the caret in between the merged titles
  const caret = previous.title.length - taskToDelete.title.length - 1;
  action.setSelection([caret, caret]);

  const ret = [
    ...state.slice(0, indexToDelete),
    ...state.slice(indexToDelete + 1)
  ];

  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function completed(state: TTask[], action: TCompleted): TTask[] {
  let task = state.find(task => task.id === action.id);
  assert(task);

  // modify
  task = task!;
  task.isCompleted = action.completed;
  const ret = [...state];
  action.store.set(ret, action.id, action.selection);
  return ret;
}

export function undo(state: TTask[], action: TUndo): TTask[] {
  // debugger
  const rev = action.store.undo();
  // no more undos
  if (!rev) {
    return state;
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

export function redo(state: TTask[], action: TUndo): TTask[] {
  const rev = action.store.redo();
  // no more redos
  if (!rev) {
    return state;
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
  return tasks.filter(t => t.parentID === id);
}
