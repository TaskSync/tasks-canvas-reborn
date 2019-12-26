import uniqid from "uniqid";
import { TTask } from "./tasklist";

// types

export type TUpdate = { type: "update"; task: TTask } & TActionBase;
export type TIndent = { type: "indent"; id: string } & TActionBase;
export type TCompleted = {
  type: "completed";
  id: string;
  completed: boolean;
} & TActionBase;
export type TNewline = {
  type: "newline";
  id: string;
  pos: number;
} & TActionBase;

type TActionBase = {
  store: {
    get(): TTask[];
    set(tasks: TTask[]);
  };
};

// TODO update the timestamp

export function update(state: TTask[], action: TUpdate) {
  const task = state.find(task => task.id === action.task.id);
  task.title = action.task.title;
  console.log(`updated ${action.task.id} with`, task.title);
  return [...state];
}

export function indent(state: TTask[], action: TIndent) {
  const task = state.find(task => task.id === action.id);
  const index = state.indexOf(task);
  if (index < 1) {
    return state;
  }
  task.parentID = state[index - 1].id;
  console.log(`indent ${action.id}`);
  return [...state];
}

export function newline(state: TTask[], action: TNewline) {
  const task = state.find(task => task.id === action.id);
  const index = state.indexOf(task);
  const task1Title = task.title.slice(0, action.pos);
  const task2Title = task.title.slice(action.pos);

  task.title = task1Title;
  const task2: TTask = {
    id: uniqid(),
    title: task2Title,
    updated: {
      canvas: Date.now()
    }
  };
  return [...state.slice(0, index + 1), task2, ...state.slice(index + 1)];
}

export function completed(state: TTask[], action: TCompleted) {
  const task = state.find(task => task.id === action.id);
  task.isCompleted = action.completed;
  return [...state];
}

// types

export type TAction = TUpdate | TNewline | TIndent | TCompleted;
