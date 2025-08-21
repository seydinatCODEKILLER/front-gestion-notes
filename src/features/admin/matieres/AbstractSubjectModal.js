import { Modal } from "@/components/modal/Modal";
import { validators } from "@/utils/Validator";

export class AbstractSubjectModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("subjects");
    this.service = app.getService("subjects");
    this.config = config;
    this.isInitialized = false;
    this.niveaux = [];
    this.initPromise = this.init();
  }

  async init() {
    await this.loadNiveaux();
    this.createForm();
    this.setupModal();
    this.setupValidation();
    this.setupEvents();
    this.initForm();
    this.isInitialized = true;
  }

  async loadNiveaux() {
    try {
      this.niveaux = await this.controller.getNiveaux();
    } catch (error) {
      console.error("Erreur lors du chargement des niveaux:", error);
      this.niveaux = [];
    }
  }

  createForm() {
    this.form = document.createElement("form");
    this.form.className = "space-y-4";
    this.form.noValidate = true;
    this.form.innerHTML = this.getFormTemplate();
  }

  getFormTemplate() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nom -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Nom de la matière <span class="text-error">*</span>
            </span>
          </label>
          <input type="text" name="nom" class="input input-bordered input-primary" required maxlength="100">
          <div data-error="nom" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Niveau -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Niveau <span class="text-error">*</span>
            </span>
          </label>
          <select name="niveauId" class="select select-bordered select-primary" required>
            <option value="">Sélectionner un niveau</option>
            ${this.niveaux
              .map((n) => `<option value="${n.id}">${n.libelle}</option>`)
              .join("")}
          </select>
          <div data-error="niveauId" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Coefficient -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Coefficient <span class="text-error">*</span>
            </span>
          </label>
          <input type="number" name="coefficient" class="input input-bordered input-primary" 
                 required min="0.1" max="10" step="0.1">
          <div data-error="coefficient" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Description -->
        <div class="form-control md:col-span-2 flex flex-col">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea name="description" class="textarea textarea-bordered textarea-primary" rows="3"></textarea>
          <div data-error="description" class="text-error text-sm mt-1 hidden"></div>
        </div>
      </div>
    `;
  }

  setupModal() {
    this.modal = new Modal({
      title: this.config.title || "Matière",
      content: this.form,
      size: "lg",
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
    // À implémenter dans les classes enfants
  }

  setupEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    this.form.querySelectorAll("input, textarea, select").forEach((input) => {
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
      nom: {
        value: "",
        error: "",
        validator: async (v) => {
          if (!validators.required(v)) return "Le nom est requis";

          const niveauId = this.form.querySelector('[name="niveauId"]').value;
          if (!niveauId) return true;

          return await validators.isUniqueForNiveau(
            v,
            niveauId,
            this.service.subjectExists.bind(this.service),
            this.config.subject?.id
          );
        },
      },
      niveauId: {
        value: "",
        error: "",
        validator: (v) => validators.required(v) || "Le niveau est requis",
      },
      coefficient: {
        value: "",
        error: "",
        validator: (v) => {
          if (!validators.required(v)) return "Le coefficient est requis";
          if (!validators.isInteger(v)) return "Doit être un nombre";
          if (parseFloat(v) < 0.1) return "Minimum 0.1";
          if (parseFloat(v) > 10) return "Maximum 10";
          return true;
        },
      },
      description: {
        value: "",
        error: "",
        validator: () => true,
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
    const formData = {
      nom: this.form.querySelector('[name="nom"]').value,
      niveauId: parseInt(this.form.querySelector('[name="niveauId"]').value),
      coefficient: parseFloat(
        this.form.querySelector('[name="coefficient"]').value
      ),
      description: this.form.querySelector('[name="description"]').value,
    };

    console.log("FormData:", formData);
    return formData;
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

  async open() {
    if (!this.isInitialized) {
      await this.initPromise;
    }

    this.form.reset();
    Object.keys(this.fields).forEach((field) => this.clearError(field));
    this.initForm();
    this.modal.open();
  }

  close() {
    this.modal.close();
  }
}
