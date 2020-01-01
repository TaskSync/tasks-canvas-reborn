import deepcopy from "deepcopy";

export type TTaskID = string;

export interface TTask {
  id: TTaskID;
  title: string;
  content?: string;
  parentID: TTaskID | undefined;
  created: number;
  updated: {
    // must be timestamp (miliseconds)
    canvas: number | null;
  };
  isCompleted?: boolean;
}

export class Store {
  // old revisions for undo, newest at the front (unshifted)
  revs: TTask[][] = [];

  // TODO move those to TaskList params ???
  maxRevs = 20;
  // how many chars needs to be added / deleted to create a rev snapshot
  charsPerUndo = 10;
  // max time between typing and an undo snapshot
  msPerUndo = 2000;
  // undo pointer
  revPointer: number | undefined = undefined;

  addRev(tasks: TTask[]) {
    console.log("add rev");
    this.revs.unshift(deepcopy(tasks));
    // trim
    this.revs.length = this.maxRevs;
    this.revPointer = 0;
  }
  undo(): TTask[] | undefined {
    const length = this.revs.length;
    const atNewestRev =
      this.revPointer !== undefined && this.revPointer >= length - 1;

    if (!length || atNewestRev) {
      return;
    }

    if (this.revPointer === undefined) {
      this.revPointer = 0;
    } else {
      this.revPointer++;
    }
    return deepcopy(this.revs[this.revPointer]);
  }
  redo(): TTask[] | undefined {
    if (this.revPointer === undefined) {
      return;
    }
    const length = this.revs.length;
    if (!length || this.revPointer === 0) {
      return;
    }
    this.revPointer--;
    return deepcopy(this.revs[this.revPointer]);
  }
  set(tasks: TTask[]) {
    this.addRev(tasks)
    // persist
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  get(): TTask | null {
    const stored = localStorage.getItem("tasks");
    return stored ? JSON.parse(stored) : null;
  }
}

export default Store;
