import { TTask, TAction } from "./tasklist";

type ArgsType<T> = T extends (state, action: infer U) => any ? U : never;

type TActionBase = {
  store: {
    get(): TTask[];
    set(tasks: TTask[]);
  };
};

export type TAction = TActionUpdate | TActionNewline | TActionIndent

export type TActionUpdate = { type: "update"; task: TTask } & TActionBase
export type TActionIndent = { type: "indent"; id: string } & TActionBase
export type TActionNewline = { type: "newline"; id: string; pos: number } & TActionBase

export function update(state: TTask[], action: TActionUpdate) {
  const task = state.find(task => task.id === action.task.id);
  task.text = action.task.text;
  console.log(`updated ${action.task.id} with`, task.text);
  return [...state];
}

export function indent(state: TTask[], action: TActionIndent) {
  // TODO
  console.log(`indent ${action.id}`);
  return [...state];
}

export function newline(state: TTask[], action: TActionNewline) {
  // TODO
  console.log(`newline ${action.id}`);
  return [...state];
}
