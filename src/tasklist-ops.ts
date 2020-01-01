import uniqid from "uniqid";
import Store from "./store";
import { TTask, TTaskID } from "./store";
// import { map } from "lodash-es";
import assert from "assert";

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

export type TUpdate = {
  type: "update";
  id: string;
  title: string;
} & TActionBase;
export type TIndent = { type: "indent"; id: string } & TActionBase;
export type TUnIndent = { type: "unindent"; id: string } & TActionBase;
export type TCompleted = {
  type: "completed";
  id: string;
  completed: boolean;
} & TActionBase;
export type TUndo = {
  type: "undo";
} & TActionBase;
export type TRedo = {
  type: "redo";
} & TActionBase;
export type TNewline = {
  type: "newline";
  id: string;
  pos: number;
  setFocusedID(id: TTaskID): void;
} & TActionBase;
export type TMergePrevLine = {
  type: "mergePrevLine";
  id: string;
  setFocusedID(id: TTaskID): void;
} & TActionBase;

type TActionBase = {
  store: Store;
};

// TODO update the timestamp

export function update(state: TTask[], action: TUpdate) {
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
  action.store.set(ret);
  return ret;
}

export function indent(state: TTask[], action: TIndent) {
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
  action.store.set(ret);
  return ret;
}

export function unindent(state: TTask[], action: TUnIndent) {
  let task = state.find(task => task.id === action.id);
  assert(task);
  task = task!;

  // modify
  task.parentID = undefined;
  console.log(`unindent ${action.id}`);
  // TODO unindent next siblings
  const ret = [...state];
  action.store.set(ret);
  return ret;
}

// splits a task to two on Enter key
export function newline(state: TTask[], action: TNewline) {
  let task = state.find(task => task.id === action.id);
  assert(task);
  task = task!;

  // modify
  const index = state.indexOf(task);
  const task1Title = task.title.slice(0, action.pos);
  const task2Title = task.title.slice(action.pos);

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

  action.store.set(ret);
  action.setFocusedID(task2.id);
  return ret;
}

// merges two tasks into one after Backspace on the line beginning
export function mergePrevLine(state: TTask[], action: TNewline) {
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
  // TODO place the caret between the merged titles
  // TODO support focus char
  // action.setFocusChar(previous.title.length - 1)

  const ret = [
    ...state.slice(0, indexToDelete),
    ...state.slice(indexToDelete + 1)
  ];

  action.store.set(ret);
  return ret;
}

export function completed(state: TTask[], action: TCompleted) {
  let task = state.find(task => task.id === action.id);
  assert(task);

  // modify
  task = task!;
  task.isCompleted = action.completed;
  const ret = [...state];
  action.store.set(ret);
  return ret;
}

export function undo(state: TTask[], action: TUndo) {
  console.log('undo')
  const undo = action.store.undo();
  return undo || state;
}

export function redo(state: TTask[], action: TUndo) {
  console.log('redo')
  const redo = action.store.redo();
  return redo || state;
}

// helper functions

export function sort(tasks: TTask[], order: "created" | "updated" | "user") {}

export function getChildren(id: TTaskID, tasks: TTask[]): TTask[] {
  return tasks.filter(t => t.parentID === id);
}
