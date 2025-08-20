import { EventBus } from "@app/core/EventBus.js";
import { Store } from "@app/core/Store.js";
import ApiService from "@services/ApiService.js";
import StorageService from "@services/StorageService.js";
import { NotificationService } from "@services/NotificationService.js";
import { AuthService } from "@features/authentification/AuthService.js";
import { AuthController } from "@features/authentification/AuthController.js";
import { Router } from "@app/core/router/Router.js";
import { authRoutes } from "@features/authentification/AuthRoute.js";
import { AuthLayout } from "@layout/AuthLayout.js";
import { hydrateStoreFromLocalStorage } from "@/utils/HydrateStore";
import { DashboardService } from "@/features/admin/dashboard/DashboardService";
import { DashboardController } from "@/features/admin/dashboard/DashboardController";
import { AdminLayout } from "@/layout/AdminLayout";
import { adminRoutes } from "@/routes/DashboardRoute";
import { TrimestreService } from "@/features/admin/trimestre/TrimestreService";
import { AnneeScolaireService } from "@/features/admin/annee_scolaire/AnneeScolaireService";
import { ErrorLayout } from "@/layout/ErrorLayout";
import { errorRoutes } from "@/features/error/ErrorRoute";
import { NiveauService } from "@/features/admin/niveaux/NiveauService";
import { NiveauController } from "@/features/admin/niveaux/NiveauController";
import { AnneeScolaireController } from "@/features/admin/annee_scolaire/AnneeScolaireController";
import { TrimestreController } from "@/features/admin/trimestre/TrimestreController";

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
    this.services.auth = new AuthService(this);
    this.services.annee_scolaire = new AnneeScolaireService(this);
    this.services.trimestres = new TrimestreService(this);
    this.services.dashboard = new DashboardService(this);
    this.services.niveaux = new NiveauService(this);

    this.controllers = {
      auth: new AuthController(this),
      dashboard: new DashboardController(this),
      niveaux: new NiveauController(this),
      annee_scolaire: new AnneeScolaireController(this),
      trimestres: new TrimestreController(this)
    };

    this.router = new Router(this, {
      mode: "history",
    });

    this.router.addLayout("auth", AuthLayout);
    this.router.addLayout("admin", AdminLayout);
    this.router.addLayout("error", ErrorLayout);

    this.router.addRoutes(authRoutes);
    this.router.addRoutes(adminRoutes);
    this.router.addRoutes(errorRoutes);

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
