import { AbstractView } from "@/app/abstract/AbstractView.js";
import { LoginSchema,validateAuthData } from "@features/authentification/AuthSchema.js";

export class AuthView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("auth");
    this.formConfig = {
      email: { type: "email", required: true },
      password: { type: "password", required: true },
    };
  }

  async render() {
    this.container = document.createElement("div");
    this.container.className = "auth-view";
    this.container.innerHTML = this.getTemplate();
    this.bindEvents();
    return this.container;
  }

  getTemplate() {
    return `
      <div class="absolute top-2 left-5 flex items-center gap-2">
        <i class="ri-nft-fill text-purple-500 text-xl"></i>
        <p class="text-gray-800 font-medium">E-Boutique</p>
      </div>
        <form id="loginForm" class="w-full md:w-[340px] lg:w-[400px] p-3 mt-4">
        <p class="text-gray-600 text-sm font-medium w-full md:w-96 mb-5">
          Bienvenue sur la plateforme de <span class="badge badge-soft badge-primary">gestion de dettes</span> ! Connectez-vous pour
          accéder à votre <span class="badge badge-soft badge-info">espace personnel</span>
        </p>
        <div class="mb-4">
          <label class="block text-gray-500 font-medium text-sm mb-2">Email</label>
          <div class="relative">
            <input
              type="email"
              id="email"
              placeholder="votre adresse email"
              class="w-full px-3 py-2 border rounded shadow-sm border-gray-200 bg-white focus:outline-none focus:border-blue-500"
            />
            <i class="ri-mail-ai-line absolute right-2 top-2"></i>
          </div>
          <div class="error-message" id="email-error"></div>
        </div>
        <div class="mb-4">
          <label class="block text-gray-500 font-medium text-sm mb-2">Mot de passe</label>
          <div class="relative">
            <input
              type="password"
              id="password"
              placeholder="votre password"
              class="w-full px-3 py-2 border shadow-sm rounded border-gray-200 bg-white focus:outline-none focus:border-blue-500"
            />
            <i class="ri-lock-password-line absolute right-2 top-2"></i>
          </div>
            <div class="error-message" id="password-error"></div>
        </div>
        <button
          type="submit"
          id="loginButton"
          class="w-full btn btn-primary text-white font-medium"
        >
          <span id="buttonText">Se connectez</span>
          <span id="spinner" class="loading loading-spinner hidden"></span>
        </button>
      </form>
    `;
  }

  bindEvents() {
    const form = this.container.querySelector("#loginForm");

    Object.keys(this.formConfig).forEach((field) => {
      const input = form.querySelector(`#${field}`);
      input.addEventListener("blur", () => this.validateField(input));
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (this.validateForm()) {
        await this.handleSubmit();
      }
    });
  }

  validateForm() {
    const formData = this.getFormData();
    const { isValid, errors } = validateAuthData(formData, LoginSchema);

    if (!isValid) {
      this.displayErrors(errors);
      return false;
    }
    return true;
  }

  validateField(input) {
    const field = input.id;
    const partialSchema = LoginSchema.pick({ [field]: true });
    const { isValid, errors } = validateAuthData(
      { [field]: input.value },
      partialSchema
    );

    this.displayErrors(isValid ? null : { [field]: errors[field] });
    return isValid;
  }

  async handleSubmit() {
    this.setLoading(true);
    try {
      await this.controller.login(this.getFormData());
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      this.setLoading(false);
    }
  }

  getFormData() {
    const form = this.container.querySelector("#loginForm");
    return {
      email: form.email.value.trim(),
      password: form.password.value.trim(),
    };
  }

  displayErrors(errors) {
    Object.keys(this.formConfig).forEach((field) => {
      const errorElement = this.container.querySelector(`#${field}-error`);
      const input = this.container.querySelector(`#${field}`);

      if (errors?.[field]) {
        errorElement.textContent = errors[field][0];
        errorElement.classList.add("text-red-500");
        input.classList.add("input-error");
      } else {
        errorElement.textContent = "";
        errorElement.classList.remove("text-red-500");
        input.classList.remove("input-error");
      }
    });
  }

  setLoading(isLoading) {
    const button = this.container.querySelector("#loginButton");
    const spinner = button.querySelector(".loading-spinner");
    const text = button.querySelector("#buttonText");

    button.disabled = isLoading;
    spinner.classList.toggle("hidden", !isLoading);
    text.textContent = isLoading ? "Connexion..." : "Se connecter";
  }
}
