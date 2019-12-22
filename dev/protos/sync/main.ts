import RootSync, { TStatsUser } from "../../../taskbot/src/sync/root";
import { test_user } from "../../../taskbot/config-accounts";
import config_base from "../../../taskbot/config";
import config_credentials from "../../../taskbot/config-private";
import { IConfig } from "../../../taskbot/src/types";
import * as merge from "deepmerge";

// TODO use client side google auth
const config: IConfig = <any>(
  merge(test_user, merge(config_base, config_credentials))
);
const sync = new RootSync(config, this.logger, this.connections);
// jump out of this tick
sync.state.addNext("Enabled");

// TODO waint on ready
const tasks = sync.data.data;
console.log(tasks)