import { TTask, TAction } from "./tasklist";

export function update(state: TTask[], action: TAction) {
      const task = state.find(task => task.id === action.task.id);
      task.text = action.task.text;
      console.log(`updated ${action.task.id} with`, task.text);
      return [...state];
}

export function indent(state: TTask[], action: TAction) {
      // TODO
      console.log(`indent ${action.id}`);
      return [...state];
}

export function newline(state: TTask[], action: TAction) {
      // TODO
      console.log(`newline ${action.id}`);
      return [...state];
}