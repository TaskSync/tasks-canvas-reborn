import RootStore from './root';
import RouterStore from './router';

export type TConfig = {
  api_url: string;
  api_url_testnet: string;
  api_url_devnet: string;
  domain: string;
  explorer_url: string;
  date_format: string;
  fiat_currencies: string[];
  max_drawer_accounts: number;
  // seconds
  suggested_delegates_cache_sec: number;
};

export type TStores = {
  store: RootStore;
  routerStore: RouterStore;
};

/**
 * Dynamic store for the currently selected account.
 * @param stores
 */
export function accountStore(stores: TStores) {
  return {
    // accountStore: stores.walletStore.selectedAccount
  };
}
