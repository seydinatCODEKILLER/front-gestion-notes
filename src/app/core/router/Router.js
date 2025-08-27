import { LRUCache } from "@app/core/router/lru-cache.js";
import { pathToRegex, matchRoute } from "@app/core/router/router-utils.js";
import { ScrollManager } from "@app/core/router/scroll-manager.js";
import { SuspenseManager } from "@app/core/router/suspense-manager.js";
import { TransitionAnimator } from "@app/core/router/transition-animator.js";

export class Router {
  constructor(app, config = {}) {
    this.app = app;
    this.routes = [];
    this.layouts = new Map();

    this.viewCache = new LRUCache(config.cacheSize || 10);
    this.layoutCache = new LRUCache(5);
    this.scrollManager = new ScrollManager();
    this.suspenseManager = new SuspenseManager();
    this.suspenseManager.injectStyles();

    this.transitionAnimator = new TransitionAnimator();
    this.nestedRouteCache = new LRUCache(20);

    this.current = { route: null, layout: null, view: null, params: {} };

    this.config = {
      root: "/",
      mode: "history",
      scrollRestoration: "auto",
      defaultLayout: "default",
      sensitive: false,
      strict: false,
      ...config,
    };

    this.init();
  }

  /* Initialisation */
  init() {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = this.config.scrollRestoration;
    }

    this.boundHandlePopState = this.handleNavigation.bind(this);
    window.addEventListener("popstate", this.boundHandlePopState);
    document.addEventListener("DOMContentLoaded", this.boundHandlePopState);
    document.addEventListener("click", this.handleLinkClick.bind(this));
  }

  /* Gestion des layouts */
  addLayout(name, component) {
    if (typeof component !== "function") {
      throw new Error("Layout must be a constructor function");
    }
    this.layouts.set(name, component);
    return this;
  }

  async getLayout(name) {
    const layoutName = name || this.config.defaultLayout;
    if (this.layoutCache.has(layoutName))
      return this.layoutCache.get(layoutName);

    const LayoutClass = this.layouts.get(layoutName);
    if (!LayoutClass) throw new Error(`Layout "${layoutName}" not found`);

    const layout = new LayoutClass(this.app);
    this.layoutCache.set(layoutName, layout);
    return layout;
  }

  /* Gestion des routes */
  addRoutes(routes, options = {}) {
    if (!Array.isArray(routes)) routes = [routes];

    routes.forEach((route) => {
      if (!route.path || !route.component)
        throw new Error("Route requires path and component");

      const compiledRoute = {
        ...route,
        path: this.normalizePath(route.path),
        meta: { ...options.meta, ...route.meta },
        guards: [...(options.guards || []), ...(route.guards || [])],
        middlewares: [
          ...(options.middlewares || []),
          ...(route.middlewares || []),
        ],
        regex: pathToRegex(route.path, {
          strict: this.config.strict,
          sensitive: this.config.sensitive,
        }),
        params: this.extractParams(route.path),
        layout: route.meta?.layout || this.config.defaultLayout,
      };

      if (
        typeof compiledRoute.component === "function" &&
        !compiledRoute.component.prototype
      ) {
        compiledRoute._component = compiledRoute.component;
        compiledRoute.component = null;
      }

      this.routes.push(compiledRoute);
    });

    // Trie par spécificité
    this.routes.sort((a, b) => {
      if (!a.path.includes(":") && b.path.includes(":")) return -1;
      if (a.path.includes(":") && !b.path.includes(":")) return 1;
      return b.path.split("/").length - a.path.split("/").length;
    });

    return this;
  }

  /* Navigation */
  async handleNavigation() {
    const { path, queryParams, hash } = this.getCurrentPathDetails();
    console.log(path);

    const matched = matchRoute(path, this.routes);

    if (!matched) return this.handleNotFound();
    if (!(await this.runGuards(matched.route))) return;

    await this.transitionTo(matched.route, {
      ...matched.params,
      ...queryParams,
      hash,
    });
  }

  async transitionTo(route, params = {}, options = {}) {
    if (this.transitionAnimator.isTransitioning) return;
    await this.transitionAnimator.startTransition();

    try {
      // Lazy load de la vue si nécessaire
      if (route._component && !route.component) {
        this.suspenseManager.showLoader();
        route.component = (await route._component()).default;
      }

      // Layout
      const layout = await this.getLayout(route.layout);

      // Si le layout change, on détruit l'ancien
      if (this.current.layout !== layout) {
        await this.destroyCurrentLayout();
        this.current.layout = layout;
        await layout.setup();
      }

      // Vue : détruire l'ancienne avant de créer/rendre la nouvelle
      await this.destroyCurrentView();

      const view = await this.getViewWithExpiry(route, params);

      // Middlewares avant rendu
      await this.runMiddlewares(route, "beforeResolve", view);

      // Sauvegarder scroll
      this.scrollManager.saveScrollPosition(this.current.route?.path);

      // Rendu
      this.suspenseManager.showLoader();
      await this.current.layout.beforeRender?.(view);
      await view.render();
      await this.current.layout.renderView(view);

      // Routes imbriquées
      if (route.meta?.parentRoute) {
        await this.handleNestedRoute(route, params, view);
      }

      // Liens actifs
      this.updateActiveState(route.path);

      // Metadata
      this.updatePageMetadata(view, route);

      // Mettre à jour l'état actuel
      this.current.route = route;
      this.current.view = view;
      this.current.params = params;

      // Restaurer scroll
      this.scrollManager.restoreScrollPosition(route.path);

      // Animation de transition
      await this.transitionAnimator.animateViewTransition(
        this.current.view?.element,
        view.element
      );

      // Historique
      if (options.replace) {
        history.replaceState({ key: Date.now() }, "", route.path);
      } else {
        history.pushState({ key: Date.now() }, "", route.path);
      }
    } catch (err) {
      this.handleError(err, route);
    } finally {
      this.suspenseManager.hideLoader();
      await this.transitionAnimator.endTransition();
    }
  }

  /* Helpers navigation & path */
  getCurrentPathDetails() {
    let path =
      this.config.mode === "hash"
        ? window.location.hash.slice(1) || "/"
        : window.location.pathname.replace(this.config.root, "") || "/";
    const queryString = window.location.search;
    const hash = window.location.hash || "";
    const queryParams = {};
    if (queryString)
      new URLSearchParams(queryString).forEach((v, k) => (queryParams[k] = v));
    return { path: this.normalizePath(path), queryParams, hash };
  }

  normalizePath(path) {
    if (!path.startsWith("/")) path = "/" + path;
    path = path.replace(/\/+/g, "/");
    if (!this.config.strict && path.endsWith("/") && path !== "/")
      path = path.slice(0, -1);
    return path;
  }

  extractParams(path) {
    return path
      .split("/")
      .filter((s) => s.startsWith(":"))
      .map((s) => (s.endsWith("?") ? s.slice(1, -1) : s.slice(1)));
  }

  async getViewWithExpiry(route, params) {
    const cacheKey = this.getCacheKey(route, params);
    const cached = this.viewCache.get(cacheKey);

    if (
      cached &&
      (!route.meta?.cacheExpiry ||
        Date.now() - cached.timestamp < route.meta.cacheExpiry * 60000)
    ) {
      return cached.view;
    }

    const view = new route.component(this.app, { params, route });
    this.viewCache.set(cacheKey, { view, timestamp: Date.now() });
    return view;
  }

  getCacheKey(route, params) {
    return (
      route.path +
      "?" +
      route.params.map((p) => `${p}=${params[p] || ""}`).join("&")
    );
  }

  navigateTo(path, options = {}) {
    const normalized = this.normalizePath(path);
    if (normalized === this.getCurrentPathDetails().path) return;
    this.transitionTo(matchRoute(normalized, this.routes)?.route, {}, options);
  }

  handleLinkClick(event) {
    const link = event.target.closest("a[href]");
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
    event.preventDefault();
    this.navigateTo(href);
  }

  /* Middlewares & Guards */
  async runGuards(route) {
    if (!route.guards?.length) return true;
    for (const Guard of route.guards) {
      const result = await Guard.execute(this.app, route);
      if (!result.granted) {
        this.navigateTo(result.redirect || "/", { replace: true });
        return false;
      }
    }
    return true;
  }

  async runMiddlewares(route, hook, view) {
    if (!route.middlewares?.length) return;
    for (const middleware of route.middlewares) {
      if (typeof middleware[hook] === "function")
        await middleware[hook](this.app, route, view);
    }
  }

  /* Layout / View cleanup */
  async destroyCurrentLayout() {
    if (this.current.layout) {
      await this.current.layout.beforeDestroy?.();
      this.current.layout.destroy?.();
      this.current.layout = null;
    }
  }

  async destroyCurrentView() {
    if (this.current.view) {
      await this.current.view.beforeDestroy?.();

      // Vérifie si la vue est encore en cache
      let isCached = false;
      for (const { view } of this.viewCache.values()) {
        if (view === this.current.view) {
          isCached = true;
          break;
        }
      }

      if (!isCached) {
        this.current.view.destroy?.();
      }

      this.current.view = null;
    }
  }

  /* Nested routes */
  async handleNestedRoute(route, params, view) {
    const parentRoute = this.routes.find(
      (r) => r.name === route.meta.parentRoute
    );
    if (!parentRoute) return;

    const cacheKey = `${parentRoute.path}|${route.path}`;
    if (!this.nestedRouteCache.has(cacheKey)) {
      const parentView = await this.getViewWithExpiry(parentRoute, params);
      this.nestedRouteCache.set(cacheKey, { parent: parentView, child: view });
      await parentView.render();
      await this.current.layout.renderView(parentView, view);
    }
    this.updateActiveState(parentRoute.path);
  }

  /* Active links & Metadata */
  updateActiveState(path) {
    if (this.current.layout?.updateActiveLink) {
      this.current.layout.updateActiveLink(path);
      const basePath = path.split("/").slice(0, 3).join("/");
      if (basePath !== path) this.current.layout.updateActiveLink(basePath);
    }
  }

  updatePageMetadata(view, route) {
    document.title = view.title || route.meta?.title || this.app.config.title;
    if (route.meta?.description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = route.meta.description;
    }
  }

  /* Errors & NotFound */
  async handleNotFound() {
    const notFoundRoute = this.routes.find((r) => r.path === "/404");
    if (notFoundRoute)
      await this.transitionTo(notFoundRoute, {}, { replace: true });
    else console.error("Route not found and no 404 handler");
  }

  async handleError(error, route) {
    console.error(`Route error [${route.path}]:`, error);
    if (this.app.config.errorTracking) this.app.trackError(error);

    const errorRoute =
      this.routes.find((r) => r.path === "/500") ||
      this.routes.find((r) => r.meta?.isErrorHandler);
    if (errorRoute) await this.transitionTo(errorRoute, {}, { replace: true });
  }

  /* Prefetch / SSR */
  async prefetchRoutes(routes) {
    await Promise.all(
      routes.map(async (r) => {
        if (r._component) r.component = (await r._component()).default;
      })
    );
  }

  /* Cache cleanup */
  cleanupCache(maxAgeMinutes = 60) {
    const now = Date.now();
    [...this.viewCache.keys()].forEach((key) => {
      const cached = this.viewCache.get(key);
      if (cached && now - cached.timestamp > maxAgeMinutes * 60000)
        this.viewCache.delete(key);
    });
    [...this.nestedRouteCache.keys()].forEach((key) => {
      const cached = this.nestedRouteCache.get(key);
      if (cached && now - cached.timestamp > maxAgeMinutes * 60000)
        this.nestedRouteCache.delete(key);
    });
  }

  /* Démarrage du router */
  start() {
    this.handleNavigation();
  }
}
