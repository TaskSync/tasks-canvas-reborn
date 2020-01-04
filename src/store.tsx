// @ts-ignore
import deepcopy from "deepcopy";

export type TTaskID = string;

export interface TTask {
  id: TTaskID;
  title: string;
  content?: string;
  // TODO
  // tasklist: TTaskListID;
  parent?: TTaskID;
  // user sorting
  previous?: TTaskID;
  // TODO iso date ?
  created: number;
  // TODO iso date ?
  updated: number;
  isCompleted?: boolean;
}

export interface TRev {
  tasks: TTask[];
  focusedID: string;
  selection: TSelection;
}

export type TSelection = [number, number];

export class Store {
  // old revisions for undo, newest at the front (unshifted)
  revs: TRev[] = [];

  // TODO move those to TaskList params ???
  maxRevs = 20;
  // how many chars needs to be added / deleted to create a rev snapshot
  charsPerUndo = 10;
  // max time between typing and an undo snapshot
  msPerUndo = 2000;
  // undo pointer
  revPointer: number | undefined = undefined;

  addRev(tasks: TTask[], focusedID: string, selection: TSelection) {
    console.log("add rev", focusedID, selection);
    this.revs.unshift({
      tasks: deepcopy(tasks),
      focusedID,
      selection
    });
    // trim
    this.revs.length = Math.min(this.revs.length, this.maxRevs);
    this.revPointer = 0;
  }

  undo(): TRev | undefined {
    if (this.revPointer === undefined) {
      // not initialized
      return;
    }
    const length = this.revs.length;
    const atLatestRev = this.revPointer >= length - 1;

    if (!length || atLatestRev) {
      return;
    }

    this.revPointer++;
    return deepcopy(this.revs[this.revPointer]);
  }

  redo(): TRev | undefined {
    if (this.revPointer === undefined) {
      // not initialized
      return;
    }
    const length = this.revs.length;
    if (!length || this.revPointer === 0) {
      return;
    }
    this.revPointer--;
    return deepcopy(this.revs[this.revPointer]);
  }

  set(tasks: TTask[], focusedID: string, selection: TSelection) {
    this.addRev(tasks, focusedID, selection);
    // persist
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  get(): TTask[] | null {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : null;
  }
}

export default Store;
