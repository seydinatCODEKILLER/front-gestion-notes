import { IMAGES } from "../utils/assets.js";

export class AuthLayout {
  // Constantes pour les classes CSS
  static CONTAINER_CLASSES = [
    "h-screen",
    "flex",
    "items-center",
    "justify-center",
    "w-full",
    "inset-0",
    "bg-gradient-to-r",
    "from-indigo-50/50",
    "to-white",
  ];

  static CARD_CLASSES = [
    "w-full",
    "md:w-[700px]",
    "lg:w-[1000px]",
    "flex",
    "items-center",
    "h-full",
    "md:h-[90vh]",
    "p-2",
    "shadow-lg",
    "rounded-xl",
    "bg-white",
  ];

  constructor(app) {
    this.app = app;
    this.container = null;
    this.contentArea = null;
    this.boundRetryHandler = (e) => this.#handleRetryClick(e);
  }

  async setup() {
    this.#createContainer();
    this.#renderBaseStructure();
    document.body.appendChild(this.container);
    this.#cacheDOMElements();
    this.#setupEventListeners();
  }

  #createContainer() {
    this.container = document.createElement("div");
    this.container.className = AuthLayout.CONTAINER_CLASSES.join(" ");
  }

  #renderBaseStructure() {
    this.container.innerHTML = `
      <div class="${AuthLayout.CARD_CLASSES.join(" ")}">
        <img src="${IMAGES.background}" 
             alt="Fond d'écran d'authentification" 
             class="h-full object-cover w-1/2 rounded-xl hidden md:block" />
        <div class="relative w-full md:w-1/2 flex flex-col items-center justify-center h-full" 
             id="auth-content">
          <!-- Contenu dynamique -->
        </div>
      </div>
    `;
  }

  #cacheDOMElements() {
    this.contentArea = this.container.querySelector("#auth-content");
  }

  #setupEventListeners() {
    this.container.addEventListener("click", this.boundRetryHandler);
  }

  #handleRetryClick(e) {
    if (e.target.closest("#retry-button")) {
      this.#handleRetry();
    }
  }

  #handleRetry() {
    // Solution SPA-friendly au lieu de window.location.reload()
    if (this.app.router) {
      this.app.router.handleNavigation();
    } else {
      window.location.reload(); // Fallback
    }
  }

  async renderView(view) {
    if (!view || typeof view.getContent !== "function") {
      console.error("Invalid view provided to AuthLayout");
      return;
    }

    try {
      this.contentArea.innerHTML = "";
      const content = await view.getContent();

      if (content) {
        this.contentArea.appendChild(content);
      } else {
        console.warn("View returned no content");
        this.#showErrorFallback();
      }
    } catch (error) {
      console.error("Failed to render view:", error);
      this.#showErrorFallback();
    }
  }

  #showErrorFallback() {
    this.contentArea.innerHTML = `
      <div class="text-center p-4">
        <div class="text-red-500 mb-4" role="alert">
          <i class="ri-error-warning-line text-2xl"></i>
          <p class="mt-2">Une erreur est survenue lors du chargement du contenu.</p>
        </div>
        <button id="retry-button"
                class="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                aria-label="Réessayer le chargement">
          <i class="ri-refresh-line mr-2"></i>Réessayer
        </button>
      </div>
    `;
  }

  async beforeDestroy() {
    if (this.container && document.body.contains(this.container)) {
      this.container.removeEventListener("click", this.boundRetryHandler);
      document.body.removeChild(this.container);
    }
    this.container = null;
    this.contentArea = null;
  }
}
