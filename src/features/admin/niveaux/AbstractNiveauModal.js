import { Modal } from "@/components/modal/Modal";
import { validators } from "@/utils/Validator";


export class AbstractNiveauModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("niveaux");
    this.service = app.getService("niveaux");
    this.config = config;
    this.init();
  }

  init() {
    this.createForm();
    this.setupModal();
    this.setupValidation();
    this.setupEvents();
    this.initForm();
  }

  createForm() {
    this.form = document.createElement("form");
    this.form.className = "space-y-4";
    this.form.noValidate = true;
    this.form.innerHTML = this.getFormTemplate();
  }

  getFormTemplate() {
    return `
      <div class="form-control">
        <label class="label">
          <span class="label-text flex items-center gap-2">
            Libellé <span class="text-error">*</span>
          </span>
        </label>
        <input type="text" name="libelle" class="input input-bordered input-primary" required maxlength="50">
        <div data-error="libelle" class="text-error text-sm mt-1 hidden"></div>
      </div>
    `;
  }

  setupModal() {
    this.modal = new Modal({
      title: this.config.title || "Niveau",
      content: this.form,
      size: "md",
      footerButtons: this.getFooterButtons(),
    });
  }

  getFooterButtons() {
    return [
      {
        text: "Annuler",
        className: "btn-ghost",
        action: "cancel",
        onClick: () => this.close(),
      },
      {
        text: this.getSubmitButtonText(),
        className: "btn-primary",
        action: "submit",
        onClick: (e) => this.handleSubmit(e),
        closeOnClick: false,
      },
    ];
  }

  getSubmitButtonText() {
    return "Valider";
  }

  initForm() {
  }

  setupEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    this.form.querySelectorAll("input").forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input.name));
      input.addEventListener("input", () => {
        if (this.fields[input.name]?.error) {
          this.clearError(input.name);
        }
      });
    });
  }

  setupValidation() {
    this.fields = {
      libelle: {
        value: "",
        error: "",
        validator: async (v) => {
          if (!validators.required(v)) return "Le libellé est requis";
          const currentLibelle = this.config?.niveau?.libelle || null;
          if (currentLibelle && currentLibelle.toLowerCase() === v.toLowerCase()) {
            return true;
          }

          return await validators.isUnique(
            v,
            this.service.libelleExists.bind(this.service),
            "libelle"
          );
        },
      },
    };
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!(await this.validateForm())) {
      return;
    }

    this.modal.setButtonLoading("submit", true, this.getLoadingText());

    try {
      const formData = this.getFormData();
      await this.processFormData(formData);
      this.close();
    } catch (error) {
      this.handleSubmitError(error);
    } finally {
      this.modal.setButtonLoading("submit", false);
    }
  }

  getLoadingText() {
    return "Enregistrement...";
  }

  getFormData() {
    const formData = new FormData(this.form);
    return {
      libelle: formData.get("libelle"),
    };
  }

  async processFormData(formData) {
    throw new Error("Method 'processFormData' must be implemented");
  }

  handleSubmitError(error) {
    console.error("Erreur formulaire:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue",
      "error"
    );
  }

  async validateForm() {
    let isValid = true;

    for (const field of Object.keys(this.fields)) {
      await this.validateField(field);
      if (this.fields[field].error) isValid = false;
    }

    return isValid;
  }

  async validateField(name) {
    if (!this.fields[name]) return;

    const input = this.form.querySelector(`[name="${name}"]`);
    if (!input) return;

    const value = input.value;
    this.fields[name].value = value;

    const result = await this.fields[name].validator(value);
    this.fields[name].error = typeof result === "string" ? result : "";

    this.displayError(name);
  }

  displayError(name, customError = null) {
    const error = customError || this.fields[name]?.error;
    const errorElement = this.form.querySelector(`[data-error="${name}"]`);
    const input = this.form.querySelector(`[name="${name}"]`);

    if (errorElement) {
      errorElement.textContent = error || "";
      errorElement.classList.toggle("hidden", !error);
    }

    if (input) {
      input.classList.toggle("input-error", !!error);
    }
  }

  clearError(name) {
    this.displayError(name, "");
  }

  open() {
    this.form.reset();
    Object.keys(this.fields).forEach((field) => this.clearError(field));
    this.initForm();
    this.modal.open();
  }

  close() {
    this.modal.close();
  }
}