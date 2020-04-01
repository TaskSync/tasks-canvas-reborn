// source - stack overflow
import assert from "assert";
import { TTask, now, TTaskID } from "./model";

/**
 * Creates a tasks array from a string representation.
 *
 * TODO support completed as `c` instead of `-`
 */
export function factory(tasks: string): TTask[] {
  let previousRoot: TTaskID | undefined;
  let previousChild: TTaskID | undefined;
  let previousChildPosition: number = 0;
  let previousRootPosition: number = 0;
  const ret: TTask[] = [];
  tasks = normalize(tasks);

  for (let line of tasks.split("\n")) {
    const isChild = line.startsWith("--");
    if (isChild) {
      assert(previousRoot);
    }
    assert(!isChild || previousChild || previousRoot);
    const attrs: Partial<TTask> = isChild
      ? { parent: previousRoot, position: previousChildPosition + 1 }
      : { position: previousRootPosition + 1 };
    const title = line.replace(/^-+ /, "");

    const task = t(title, attrs);

    if (isChild) {
      previousChild = task.id;
      previousChildPosition = task.position;
    } else {
      previousRoot = task.id;
      previousRootPosition = task.position;
    }
    ret.push(task);
  }

  return ret;
}

export function tasksToString(tasks: TTask[]): string {
  let ret = "";
  for (const task of tasks) {
    ret += task.parent ? "-- " : "- ";
    ret += task.title + "\n";
  }
  return ret.trim();
}

export function normalize(tasks: string): string {
  let ret = "";
  for (let line of tasks.split("\n")) {
    if (!line.trim()) {
      continue;
    }
    // always keep a space after a `-`
    ret += line.trim().replace(/^(--?)\s?/, "$1 ") + "\n";
  }
  return ret.trim();
}

/**
 * Create a task.
 * Text is also an ID, has to be unique.
 */
export function t(text: string, task?: Partial<TTask>): TTask {
  return {
    id: text,
    title: text,
    updated: now(),
    created: now(),
    position: task?.position || 0,
    parent: task?.parent || undefined,
    content: "",
    duedate: ""
  };
}
