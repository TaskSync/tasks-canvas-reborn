import { TTask } from "./tasklist";

// types

export type TUpdate = { type: "update"; task: TTask } & TActionBase;
export type TIndent = { type: "indent"; id: string } & TActionBase;
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

export function update(state: TTask[], action: TUpdate) {
  const task = state.find(task => task.id === action.task.id);
  task.text = action.task.text;
  console.log(`updated ${action.task.id} with`, task.text);
  return [...state];
}

export function indent(state: TTask[], action: TIndent) {
  // TODO
  console.log(`indent ${action.id}`);
  return [...state];
}

export function newline(state: TTask[], action: TNewline) {
  // TODO
  console.log(`newline ${action.id}`);
  return [...state];
}

// types

export type TAction = TUpdate | TNewline | TIndent;
 