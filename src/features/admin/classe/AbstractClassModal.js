import { Modal } from "@/components/modal/Modal";
import { validators } from "@/utils/Validator";

export class AbstractClassModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("classes");
    this.service = app.getService("classes");
    this.config = config;
    this.niveaux = [];
    this.anneesScolaires = [];
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  async init() {
    await Promise.all([this.loadNiveaux(), this.loadAnneesScolaires()]);
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
    const niveauxOptions = this.niveaux
      .filter((n) => n.statut === "actif")
      .map(
        (niveau) => `
        <option value="${niveau.id}">${niveau.libelle}</option>
      `
      )
      .join("");

    const anneesOptions = this.anneesScolaires
      .filter((a) => a.statut === "actif")
      .map(
        (annee) => `
        <option value="${annee.id}">${annee.libelle}</option>
      `
      )
      .join("");

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nom -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Nom <span class="text-error">*</span>
            </span>
          </label>
          <input type="text" name="nom" class="input input-bordered input-primary" required maxlength="50" placeholder="Ex: 6ème A">
          <div data-error="nom" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Capacité max -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Capacité maximale</span>
          </label>
          <input type="number" name="capacite_max" class="input input-bordered input-primary" min="1" max="50" placeholder="Ex: 30">
          <div data-error="capacite_max" class="text-error text-sm mt-1 hidden"></div>
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
            ${niveauxOptions}
          </select>
          <div data-error="niveauId" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Année scolaire -->
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
      </div>
    `;
  }

  setupModal() {
    this.modal = new Modal({
      title: this.config.title || "Classe",
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
      nom: {
        value: "",
        error: "",
        validator: async (v) => {
          if (!validators.required(v)) return "Le nom est requis";
          if (!validators.maxLength(v, 50)) return "Maximum 50 caractères";

          const anneeScolaireId = this.form.querySelector(
            '[name="anneeScolaireId"]'
          ).value;
          if (!anneeScolaireId) return true;

          const currentNom = this.config?.classe?.nom || null;
          const currentAnneeId = this.config?.classe?.anneeScolaireId || null;

          if (
            currentNom &&
            currentNom.toLowerCase() === v.toLowerCase() &&
            currentAnneeId === parseInt(anneeScolaireId)
          ) {
            return true;
          }

          const exists = await this.service.nomExists(
            v,
            parseInt(anneeScolaireId)
          );
          return exists ? "Ce nom existe déjà pour cette année scolaire" : true;
        },
      },
      capacite_max: {
        value: "",
        error: "",
        validator: (v) => {
          if (!v) return true;
          if (!validators.minValue(v, 1)) return "Minimum 1 élève";
          if (!validators.maxValue(v, 50)) return "Maximum 50 élèves";
          return true;
        },
      },
      niveauId: {
        value: "",
        error: "",
        validator: (v) => {
          if (!validators.required(v)) return "Le niveau est requis";
          return true;
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
      nom: formData.get("nom"),
      capacite_max: formData.get("capacite_max")
        ? parseInt(formData.get("capacite_max"))
        : null,
      niveauId: parseInt(formData.get("niveauId")),
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
