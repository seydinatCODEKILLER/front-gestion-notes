import { AbstractView } from "@/app/abstract/AbstractView";
import { IMAGES } from "@/utils/assets";


export class NotFoundView extends AbstractView {
  constructor(app, { params, route, error } = {}) {
    super(app, { params, route });
    this.error = error || {};
  }

  async getContent() {
    const container = document.createElement("div");
    container.className =
      "not-found-view flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto";

    const user = this.app.store.state.user;
    const homePath = this.getHomePath(user?.role);
    const buttonText = user ? "Retour à l'accueil" : "Aller à la connexion";

    container.innerHTML = `
      <div class="text-center space-y-6">
        <!-- Image d'erreur intégrée directement dans la vue -->
        <div class="error-image">
          <img src="${IMAGES.error_illustration}" alt="Page non trouvée" 
               class="mx-auto h-64 md:h-80 lg:h-96 object-contain" />
        </div>
        
        <div class="space-y-3">
          <h1 class="text-4xl font-bold text-gray-900">${this.getErrorCode()}</h1>
          <h2 class="text-2xl font-semibold text-gray-800">${this.getErrorMessage()}</h2>
          <p class="text-gray-600 text-lg">${this.getErrorDescription()}</p>
        </div>
      </div>
      
      <div class="pt-6">
        <a href="${homePath}" class="btn btn-primary btn-lg" data-router-link>
          <i class="ri-home-line mr-2"></i>
          ${buttonText}
        </a>
      </div>
      
    `;

    return container;
  }

  getErrorCode() {
    return this.error.code || "404";
  }

  getErrorMessage() {
    return this.error.message || "Page non trouvée";
  }

  getErrorDescription() {
    return (
      this.error.description ||
      "La page que vous recherchez n'existe pas ou a été déplacée."
    );
  }

  getHomePath(role) {
    const routes = {
      admin: "/admin/dashboard",
      professeur: "/professeur/dashboard"
    };

    return routes[role] || "/login";
  }

  async setup() {
    console.log("NotFoundView initialisée");
  }
}
