/// <reference path="utils/missing.d.ts"/>
import { Provider } from 'mobx-react';
import { startRouter } from 'mobx-router-rise';
import React from 'react';
import ReactDOM from 'react-dom';
import config from './config.json';
import App from './containers/App';
import './polyfills';
import * as routes from './routes';
import { TConfig, TStores } from './stores';
import RootStore from './stores/root';

const store = new RootStore((config as any) as TConfig);
startRouter(routes, store, { strict: false });

const stores: TStores = {
  store,
  routerStore: store.router,
};

const root = (
  <Provider {...stores}>
    <App />
  </Provider>
);

ReactDOM.render(root, document.getElementById('root') as HTMLElement);
