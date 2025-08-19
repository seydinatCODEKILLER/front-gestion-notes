import { AbstractView } from "@/app/abstract/AbstractView";
import { IMAGES } from "@/utils/assets.js";

export class UnauthorizedView extends AbstractView {
  constructor(app, { params, route, error } = {}) {
    super(app, { params, route });
    this.error = error || {};
  }

  async getContent() {
    const container = document.createElement("div");
    container.className =
      "unauthorized-view flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto p-6";

    const user = this.app.store.state.user;
    const homePath = this.getHomePath(user?.role);
    const loginPath = "/login";

    container.innerHTML = `
      <div class="text-center space-y-6">
        <!-- Image d'erreur d'autorisation -->
        <div class="error-image">
          <img src="${
            IMAGES.error_unauthorized || "/assets/images/unauthorized.svg"
          }" 
               alt="Accès non autorisé" 
               class="mx-auto h-56 md:h-72 lg:h-80 object-contain" />
        </div>
        
        <div class="space-y-4">
          <h1 class="text-4xl font-bold text-gray-900">403</h1>
          <h2 class="text-2xl font-semibold text-gray-800">Accès refusé</h2>
          
          <div class="space-y-2">
            <p class="text-gray-600 text-lg">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            
            ${
              user
                ? `
              <p class="text-sm text-gray-500">
                Connecté en tant que: <span class="font-medium">${user.role}</span>
              </p>
            `
                : `
              <p class="text-sm text-gray-500">
                Vous devez être connecté pour accéder à cette ressource.
              </p>
            `
            }
          </div>
        </div>
      </div>
      
      <div class="pt-6 space-y-4 w-full max-w-xs">
        ${
          user
            ? `
          <a href="${homePath}" class="btn btn-primary btn-lg w-full" data-router-link>
            <i class="ri-home-line mr-2"></i>
            Retour à l'accueil
          </a>
        `
            : `
          <a href="${loginPath}" class="btn btn-primary btn-lg w-full" data-router-link>
            <i class="ri-login-box-line mr-2"></i>
            Se connecter
          </a>
        `
        }
      </div>
      
      ${this.getPermissionsInfo()}
      ${this.getDebugInfo()}
    `;

    return container;
  }

  getPermissionsInfo() {
    const user = this.app.store.state.user;
    if (!user) return "";


    return `
      <div class="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-md">
        <h4 class="font-semibold text-blue-800 mb-2">
          <i class="ri-information-line mr-2"></i>
          Informations d'autorisation
        </h4>
        
        <div class="space-y-2 text-sm">
          <p><strong>Votre rôle:</strong> <span class="text-blue-700">${
            user.role
          }</span></p>
        </div>
      </div>
    `;
  }

  getHomePath(role) {
    const routes = {
      admin: "/admin/dashboard",
      professeur: "/professeur/dashboard",
    };

    return routes[role] || "/login";
  }

  async setup() {
    console.log("UnauthorizedView initialisée", {
      user: this.app.store.state.user,
      error: this.error,
    });
  }
}
