import { Modal } from "@/components/modal/Modal";
import { validators } from "@/utils/Validator";

export class AbstractTrimestreModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("trimestres");
    this.service = app.getService("trimestres");
    this.config = config;
    this.anneesScolaires = [];
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  async init() {
    await this.loadAnneesScolaires();
    this.createForm();
    this.setupModal();
    this.setupValidation();
    this.setupEvents();
    this.initForm();
    this.isInitialized = true;
  }

  async loadAnneesScolaires() {
    try {
      this.anneesScolaires = await this.controller.getAnneesScolaires();
    } catch (error) {
      console.error("Erreur lors du chargement des années scolaires:", error);
      this.anneesScolaires = [];
    }
  }

  createForm() {
    this.form = document.createElement("form");
    this.form.className = "space-y-4";
    this.form.noValidate = true;
    this.form.innerHTML = this.getFormTemplate();
  }

  getFormTemplate() {
    const anneesOptions = this.anneesScolaires
      .map(
        (annee) => `
        <option value="${annee.id}" ${
          annee.statut === "actif" ? "selected" : ""
        }>
          ${annee.libelle} ${annee.statut === "actif" ? "(Active)" : ""}
        </option>
      `
      )
      .join("");

    return `
      <div class="form-control">
        <label class="label">
          <span class="label-text flex items-center gap-2">
            Libellé <span class="text-error">*</span>
          </span>
        </label>
        <input type="text" name="libelle" class="input input-bordered input-primary" required maxlength="10" placeholder="Ex: Trimestre 1">
        <div data-error="libelle" class="text-error text-sm mt-1 hidden"></div>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text flex items-center gap-2">
            Année scolaire <span class="text-error">*</span>
          </span>
        </label>
        <select name="anneeScolaireId" class="select select-bordered select-primary" required>
          <option value="">Sélectionner une année scolaire</option>
          ${anneesOptions}
        </select>
        <div data-error="anneeScolaireId" class="text-error text-sm mt-1 hidden"></div>
      </div>
    `;
  }

  setupModal() {
    this.modal = new Modal({
      title: this.config.title || "Trimestre",
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
    // À implémenter dans les classes enfants
  }

  setupEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    this.form.querySelectorAll("input, select").forEach((input) => {
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
          if (!validators.maxLength(v, 15)) return "Maximum 10 caractères";

          const anneeScolaireId = this.form.querySelector(
            '[name="anneeScolaireId"]'
          ).value;
          if (!anneeScolaireId) return true;

          const currentLibelle = this.config?.trimestre?.libelle || null;
          const currentAnneeId =
            this.config?.trimestre?.anneeScolaireId || null;

          if (
            currentLibelle &&
            currentLibelle.toLowerCase() === v.toLowerCase() &&
            currentAnneeId === parseInt(anneeScolaireId)
          ) {
            return true;
          }

          const exists = await this.service.libelleExists(
            v,
            parseInt(anneeScolaireId)
          );
          return exists
            ? "Ce libellé existe déjà pour cette année scolaire"
            : true;
        },
      },
      anneeScolaireId: {
        value: "",
        error: "",
        validator: (v) => {
          if (!validators.required(v)) return "L'année scolaire est requise";
          return true;
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
      anneeScolaireId: parseInt(formData.get("anneeScolaireId")),
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

  async open() {
    // Attendre que l'initialisation soit complète
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