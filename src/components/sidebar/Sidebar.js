export default class Sidebar {
  // Constantes pour les classes CSS réutilisées
  static ACTIVE_LINK_CLASSES = [
    "bg-purple-500",
    "text-white",
    "rounded-3xl",
    "shadow-lg",
  ];

  static BASE_SIDEBAR_CLASSES = [
    "flex",
    "flex-col",
    "justify-between",
    "p-3",
    "fixed",
    "left-0",
    "shadow-md",
    "h-full",
    "bg-white",
    "text-gray-900",
    "w-64",
    "lg:w-52",
    "transform",
    "transition-transform",
    "duration-300",
    "ease-in-out",
    "translate-x-0",
    "z-50",
  ];

  constructor(options) {
    this.config = this.#mergeDefaultsWithOptions(options);
    this.element = null;
    this.linkElements = [];
  }

  #mergeDefaultsWithOptions(options) {
    const defaults = {
      logo: { icon: "ri-code-s-slash-fill", text: "E221" },
      user: { avatar: "", role: "", name: "" },
      links: [],
      onLogout: () => {},
      onNavigate: () => {},
    };

    return { ...defaults, ...options };
  }

  render(container) {
    if (!container) {
      console.error("Container element is required to render sidebar");
      return;
    }

    this.element = this.#createSidebarElement();
    container.appendChild(this.element);

    this.#cacheLinkElements();
    this.#setupEventListeners();
    this.setActiveLink(window.location.pathname);
  }

  #createSidebarElement() {
    const template = document.createElement("template");
    template.innerHTML = this.#generateSidebarMarkup();
    return template.content.firstElementChild;
  }

  #generateSidebarMarkup() {
    return `
      <div id="sidebar" class="${Sidebar.BASE_SIDEBAR_CLASSES.join(" ")}">
        <div class="flex flex-col gap-6">
          ${this.#generateHeaderMarkup()}
          ${this.#generateNavigationMarkup()}
        </div>
        ${this.#generateFooterMarkup()}
      </div>
    `;
  }

  #generateHeaderMarkup() {
    return `
      <div class="flex justify-between">
        <div class="flex items-center gap-2 text-md">
          <i class="${this.config.logo.icon} text-xl"></i>
          <span class="font-medium">${this.config.logo.text}</span>
        </div>
        <div class="lg:hidden" id="sidebar-close">
          <i class="ri-layout-right-line text-lg font-semibold"></i>
        </div>
      </div>
    `;
  }

  #generateNavigationMarkup() {
    return `
      <nav class="flex flex-col gap-6">
        <ul class="flex flex-col gap-1">
          ${this.#generateLinksMarkup()}
        </ul>
      </nav>
    `;
  }

  #generateLinksMarkup() {
    return this.config.links
      .map((link) => this.#generateLinkMarkup(link))
      .join("");
  }

  #generateLinkMarkup(link) {
    return `
      <li class="py-2 px-4" data-path="${link.path || "#"}">
        <a href="${
          link.path || "#"
        }" class="font-medium gap-3 flex items-center text-sm">
          <i class="${link.icon} text-lg"></i>
          <span>${link.text}</span>
        </a>
      </li>
    `;
  }

  #generateFooterMarkup() {
    return `
      <div class="flex items-center justify-between">
        ${this.#generateUserProfileMarkup()}
        ${this.#generateDropdownMenuMarkup()}
      </div>
    `;
  }

  #generateUserProfileMarkup() {
    return `
      <div class="flex gap-1">
        <img src="${this.config.user.avatar}" alt="Avatar" class="w-9 h-9 rounded-3xl object-cover">
        <div class="flex flex-col">
          <span class="text-xs text-purple-500 font-medium">${this.config.user.role}</span>
          <p class="font-medium text-gray-800 text-xs">${this.config.user.name}</p>
        </div>
      </div>
    `;
  }

  #generateDropdownMenuMarkup() {
    return `
      <div class="dropdown dropdown-top w-9 h-9 flex justify-center items-center hover:bg-gray-50 rounded border border-gray-300">
        <i class="ri-expand-up-down-line" tabindex="0" role="button"></i>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-44 p-2 shadow-sm">
          <li>
            <a href="#/profile" class="text-sm font-semibold border-b border-gray-100">
              <i class="ri-settings-2-line font-medium"></i>
              <span>Mon compte</span>
            </a>
          </li>
          <li>
            <a id="logoutBtn" class="text-sm font-semibold">
              <i class="ri-logout-box-r-line font-medium"></i>
              <span>Déconnexion</span>
            </a>
          </li>
        </ul>
      </div>
    `;
  }

  #cacheLinkElements() {
    this.linkElements = Array.from(
      this.element.querySelectorAll("li[data-path]")
    );
  }

  #setupEventListeners() {
    this.#setupToggleListener();
    this.#setupLinkListeners();
    this.#setupLogoutListener();
  }

  #setupToggleListener() {
    const closeButton = this.element.querySelector("#sidebar-close");
    closeButton?.addEventListener("click", () => this.toggle());
  }

  #setupLinkListeners() {
    this.linkElements.forEach((li) => {
      const link = this.config.links.find((l) => l.path === li.dataset.path);
      if (!link) return;

      const anchor = li.querySelector("a");
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        this.config.onNavigate(link.path);
        this.setActiveLink(link.path);
      });
    });
  }

  #setupLogoutListener() {
    const logoutButton = this.element.querySelector("#logoutBtn");
    logoutButton?.addEventListener("click", (e) => {
      e.preventDefault();
      this.config.onLogout();
    });
  }

  toggle() {
    this.element.classList.toggle("-translate-x-full");
    this.element.classList.toggle("translate-x-0");
  }

  setActiveLink(path) {
    this.linkElements.forEach((li) => {
      const isActive = li.dataset.path === path;

      Sidebar.ACTIVE_LINK_CLASSES.forEach((className) => {
        li.classList.toggle(className, isActive);
      });
    });
  }

  onRouteChange(path) {
    this.setActiveLink(path);
  }
}
