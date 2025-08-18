import Router from "@app/core/Router.js";
import { EventBus } from "@app/core/EventBus.js";
import { Store } from "@app/core/Store.js";
import ApiService from "@/services/ApiService";
import StorageService from "@/services/StorageService";
import { NotificationService } from "@/services/NotificationService";


export class App {
  constructor(config) {
    this.config = config;
    this.eventBus = new EventBus();
    this.store = new Store(config.initialState || {});

    this.services = {
      api: new ApiService(config.apiBaseUrl),
      storage: new StorageService(),
    };

    this.services.notifications = new NotificationService(this);

    this.controllers = {};

    this.router = new Router(this, {
      mode: "history",
    });

    this.initModules();
    hydrateStoreFromLocalStorage(this.store, this.services.storage);
    this.router.start();
  }

  initModules() {}

  getService(name) {
    return this.services[name];
  }

  getController(name) {
    return this.controllers[name];
  }
}
