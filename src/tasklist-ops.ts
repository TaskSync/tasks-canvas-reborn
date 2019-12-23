import { TTask } from "./tasklist";

export function update(state: TTask[], action: TActionUpdate) {
  const task = state.find(task => task.id === action.task.id);
  task.text = action.task.text;
  console.log(`updated ${action.task.id} with`, task.text);
  return [...state];
}

export function y7indent(state: TTask[], action: TActionIndent) {
  // TODO
  console.log(`indent ${action.id}`);
  return [...state];
}

export function newline(state: TTask[], action: TActionNewline) {
  // TODO
  console.log(`newline ${action.id}`);
  return [...state];
}

// types

export type TActionUpdate = { type: "update"; task: TTask } & TActionBase;
export type TActionIndent = { type: "indent"; id: string } & TActionBase;
export type TActionNewline = {
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

export type TAction = TActionUpdate | TActionNewline | TActionIndent;

