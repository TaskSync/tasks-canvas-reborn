// @ts-ignore
import deepcopy from "deepcopy";
import Store, { TTask } from "./store";

class MockStore extends Store {
  localStorage: { [name: string]: TTask[] } = {};

  protected getLocalStorage(name: string): TTask[] | null {
    return this.localStorage[name];
  }

  protected setLocalStorage(name: string, tasks: TTask[]) {
    this.localStorage[name] = deepcopy(tasks);
  }
}

export default MockStore;
