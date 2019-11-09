import { configure, observable } from 'mobx';
import RouterStore from './router';

// make sure only actions modify the store
configure({ enforceActions: 'observed' });

export default class RootStore {
  router = new RouterStore(this);
  @observable updateAvailable: boolean = false;

  constructor(public config: TConfig) {
    this.addressBook = new AddressBookStore();
    this.onboarding = new OnboardingStore();
    this.wallet = new WalletStore(
      config,
      this.router,
      this.addressBook,
      this.lang
    );
  }
}
