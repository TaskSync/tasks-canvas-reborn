import uniqid from "uniqid";
import { Store } from "./main";
import { TTask, TTaskID } from "./tasklist";

// types

export type TUpdate = { type: "update"; task: TTask } & TActionBase;
export type TIndent = { type: "indent"; id: string } & TActionBase;
export type TUnIndent = { type: "unindent"; id: string } & TActionBase;
export type TCompleted = {
  type: "completed";
  id: string;
  completed: boolean;
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
  const task = state.find(task => task.id === action.task.id);
  task.title = action.task.title;
  console.log(`updated ${action.task.id} with`, task.title);
  const ret = [...state];
  action.store.set(ret);
  return ret;
}

export function indent(state: TTask[], action: TIndent) {
  const task = state.find(task => task.id === action.id);
  const index = state.indexOf(task);
  if (index < 1) {
    return state;
  }
  task.parentID = state[index - 1].id;
  console.log(`indent ${action.id}`);
  const ret = [...state];
  action.store.set(ret);
  return ret;
}

export function unindent(state: TTask[], action: TUnIndent) {
  const task = state.find(task => task.id === action.id);
  task.parentID = null;
  console.log(`unindent ${action.id}`);
  const ret = [...state];
  action.store.set(ret);
  return ret;
}

// splits a task to two on Enter key
export function newline(state: TTask[], action: TNewline) {
  const task = state.find(task => task.id === action.id);
  const index = state.indexOf(task);
  const task1Title = task.title.slice(0, action.pos);
  const task2Title = task.title.slice(action.pos);

  task.title = task1Title;
  const task2: TTask = {
    id: uniqid(),
    title: task2Title,
    created: Date.now(),
    updated: {
      canvas: Date.now()
    }
  };
  const ret = [...state.slice(0, index + 1), task2, ...state.slice(index + 1)];

  action.store.set(ret);
  action.setFocusedID(task2.id);
  return ret;
}

// merges two tasks into one after Backspace on the line beginning
export function mergePrevLine(state: TTask[], action: TNewline) {
  debugger;
  const taskToDelete = state.find(task => task.id === action.id);
  const indexToDelete = state.indexOf(taskToDelete);
  console.log(`mergePrevLine`, taskToDelete, indexToDelete);
  // dont merge-up the first task
  if (indexToDelete === 0) {
    return state;
  }
  const previous = state[indexToDelete - 1];
  previous.title += taskToDelete.title;
  action.setFocusedID(previous.id);
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
  const task = state.find(task => task.id === action.id);
  task.isCompleted = action.completed;
  const ret = [...state];
  action.store.set(ret);
  return ret;
}

// types

export type TAction =
  | TUpdate
  | TNewline
  | TIndent
  | TCompleted
  | TUnIndent
  | TMergePrevLine;
