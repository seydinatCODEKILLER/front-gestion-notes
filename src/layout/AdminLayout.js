import { ResponsiveHeader } from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Sidebar";


export class AdminLayout {
  constructor(app) {
    this.app = app;
    this.container = this.#createLayoutContainer();
    this.sidebarInstance = null;
    this.headerInstance = null;
  }

  #createLayoutContainer() {
    const container = document.createElement("div");
    container.className =
      "flex min-h-screen inset-0 bg-gradient-to-r from-indigo-50/50 to-white";
    return container;
  }

  #generateLayoutMarkup() {
    return `
      <div id="sidebar-container" class="hidden md:flex"></div>
      <div class="flex flex-col lg:ml-56 w-full">
        <div id="header-container" class="w-full"></div>
        <main id="main-content" class="overflow-auto"></main>
      </div>
    `;
  }

  async setup() {
    this.container.innerHTML = this.#generateLayoutMarkup();

    this.#setupHeader();
    this.#setupSidebar();

    document.body.appendChild(this.container);
  }

  #setupHeader() {
    const { nom, prenom } = this.app.store.state.user;
    console.log(this.app.store.state.user);
    

    this.headerInstance = new ResponsiveHeader({
      currentPage: "Admin",
      userName: `${prenom} ${nom}` || "Admin",
      onMenuClick: () => this.toggleSidebar(),
      onThemeChange: () => this.toggleTheme(),
    });

    this.headerInstance.render(
      this.container.querySelector("#header-container")
    );
  }

  #setupSidebar() {
    const { avatar, nom, prenom } = this.app.store.state.user;

    this.sidebarInstance = new Sidebar({
      logo: {
        icon: "ri-nft-fill text-purple-500 text-xl",
        text: "E-Gestion Note",
      },
      user: {
        avatar: avatar || "",
        role: "Admin",
        name: `${prenom} ${nom}` || "Admin",
      },
      links: this.#getSidebarLinks(),
      onNavigate: (path) => this.app.router.navigateTo(path),
      onLogout: () => this.app.getController("auth").logout(),
    });

    this.sidebarInstance.render(
      this.container.querySelector("#sidebar-container")
    );
  }

  #getSidebarLinks() {
    return [
      {
        text: "Dashboard",
        icon: "ri-dashboard-line",
        path: "/admin/dashboard",
      },
      {
        text: "Gestion Niveaux",
        icon: "ri-stack-line",
        path: "/admin/niveaux",
      },
      {
        text: "Gestion Annees",
        icon: "ri-attachment-line",
        path: "/admin/annees",
      },
      {
        text: "Gestion Trimestres",
        icon: "ri-bubble-chart-line",
        path: "/admin/trimestres",
      },
    ];
  }

  async renderView(view) {
    const main = this.container.querySelector("#main-content");
    main.innerHTML = "";

    try {
      const content = await view.getContent();
      if (content) {
        main.appendChild(content);
      }
    } catch (error) {
      console.error("Failed to render view:", error);
      main.innerHTML =
        "<p>Une erreur est survenue lors du chargement de la page.</p>";
    }
  }

  toggleSidebar() {
    this.sidebarInstance?.toggle();
  }

  toggleTheme() {
    // Implémentation future du changement de thème
    console.log("Changement de thème");
  }

  getSidebarInstance() {
    return this.sidebarInstance;
  }

  async beforeDestroy() {
    if (this.container && document.body.contains(this.container)) {
      document.body.removeChild(this.container);
    }
    this.sidebarInstance = null;
    this.headerInstance = null;
  }
}
