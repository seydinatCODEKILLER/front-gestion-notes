import { Modal } from "@/components/modal/Modal";
import { validators } from "@/utils/Validator";

export class AbstractEvaluationModal {
  constructor(app, config = {}) {
    this.app = app;
    this.controller = app.getController("evaluations");
    this.service = app.getService("evaluations");
    this.currentTeacher = app.getService("auth").getCurrentUser();
    this.config = config;
    this.classes = [];
    this.subjects = [];
    this.trimestres = [];
    this.anneesScolaires = [];
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  async init() {
    await Promise.all([
      this.loadClasses(this.currentTeacher.id),
      this.loadSubjects(this.currentTeacher.id),
      this.loadTrimestres(),
      this.loadAnneesScolaires(),
    ]);
    this.createForm();
    this.setupModal();
    this.setupValidation();
    this.setupEvents();
    this.initForm();
    this.isInitialized = true;
  }

  async loadClasses(teacherId) {
    try {
      this.classes = await this.controller.getClasses(teacherId);
    } catch (error) {
      console.error("Erreur lors du chargement des classes:", error);
      this.classes = [];
    }
  }

  async loadSubjects(teacherId) {
    try {
      this.subjects = await this.controller.getSubjects(teacherId);
      console.log(this.subjects);
    } catch (error) {
      console.error("Erreur lors du chargement des matières:", error);
      this.subjects = [];
    }
  }

  async loadTrimestres() {
    try {
      this.trimestres = await this.controller.getTrimestres();
    } catch (error) {
      console.error("Erreur lors du chargement des trimestres:", error);
      this.trimestres = [];
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
    const classesOptions = this.classes
      .filter((c) => c.statut === "actif")
      .map(
        (classe) => `
        <option value="${classe.id}">${classe.nom} - ${classe.niveau?.libelle}</option>
      `
      )
      .join("");

    const subjectsOptions = this.subjects
      .filter((s) => s.subject.statut === "actif")
      .map(
        (subject) => `
        <option value="${subject.subject.id}">${subject.subject.nom}</option>
      `
      )
      .join("");

    const trimestresOptions = this.trimestres
      .filter((t) => t.statut === "actif")
      .map(
        (trimestre) => `
        <option value="${trimestre.id}">${trimestre.libelle}</option>
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
        <!-- Titre -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Titre <span class="text-error">*</span>
            </span>
          </label>
          <input type="text" name="titre" class="input input-bordered input-primary" required maxlength="100" placeholder="Ex: Devoir de Mathématiques">
          <div data-error="titre" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Type -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Type <span class="text-error">*</span>
            </span>
          </label>
          <select name="type" class="select select-bordered select-primary" required>
            <option value="">Sélectionner un type</option>
            <option value="devoir">Devoir</option>
            <option value="composition">Composition</option>
            <option value="oral">Oral</option>
            <option value="projet">Projet</option>
          </select>
          <div data-error="type" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Classe -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Classe <span class="text-error">*</span>
            </span>
          </label>
          <select name="classId" class="select select-bordered select-primary" required>
            <option value="">Sélectionner une classe</option>
            ${classesOptions}
          </select>
          <div data-error="classId" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Matière -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Matière <span class="text-error">*</span>
            </span>
          </label>
          <select name="subjectId" class="select select-bordered select-primary" required>
            <option value="">Sélectionner une matière</option>
            ${subjectsOptions}
          </select>
          <div data-error="subjectId" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Date d'évaluation -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Date d'évaluation <span class="text-error">*</span>
            </span>
          </label>
          <input type="date" name="date_evaluation" class="input input-bordered input-primary" required>
          <div data-error="date_evaluation" class="text-error text-sm mt-1 hidden"></div>
        </div>

        <!-- Trimestre -->
        <div class="form-control">
          <label class="label">
            <span class="label-text flex items-center gap-2">
              Trimestre <span class="text-error">*</span>
            </span>
          </label>
          <select name="trimestreId" class="select select-bordered select-primary" required>
            <option value="">Sélectionner un trimestre</option>
            ${trimestresOptions}
          </select>
          <div data-error="trimestreId" class="text-error text-sm mt-1 hidden"></div>
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
      title: this.config.title || "Évaluation",
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
      titre: {
        value: "",
        error: "",
        validator: async (v) => {
          if (!validators.required(v)) return "Le titre est requis";
          if (!validators.maxLength(v, 100)) return "Maximum 100 caractères";

          const classId = this.form.querySelector('[name="classId"]').value;
          const dateEvaluation = this.form.querySelector(
            '[name="date_evaluation"]'
          ).value;

          if (!classId || !dateEvaluation) return true;

          const currentTitre = this.config?.evaluation?.titre || null;
          const currentClassId = this.config?.evaluation?.classId || null;
          const currentDate = this.config?.evaluation?.date_evaluation || null;

          if (
            currentTitre &&
            currentTitre.toLowerCase() === v.toLowerCase() &&
            currentClassId === parseInt(classId) &&
            new Date(currentDate).toDateString() ===
              new Date(dateEvaluation).toDateString()
          ) {
            return true;
          }

          const exists = await this.service.titleExists(
            v,
            parseInt(classId),
            dateEvaluation
          );
          return exists
            ? "Une évaluation avec ce titre existe déjà pour cette classe et cette date"
            : true;
        },
      },
      type: {
        value: "",
        error: "",
        validator: (v) => {
          if (!validators.required(v)) return "Le type est requis";
          return true;
        },
      },
      classId: {
        value: "",
        error: "",
        validator: (v) => {
          if (!validators.required(v)) return "La classe est requise";
          return true;
        },
      },
      subjectId: {
        value: "",
        error: "",
        validator: (v) => {
          if (!validators.required(v)) return "La matière est requise";
          return true;
        },
      },
      date_evaluation: {
        value: "",
        error: "",
        validator: (v) => {
          if (!validators.required(v)) return "La date est requise";
          return true;
        },
      },
      trimestreId: {
        value: "",
        error: "",
        validator: (v) => {
          if (!validators.required(v)) return "Le trimestre est requis";
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
    const rawDate = formData.get("date_evaluation");
    console.log("Current teacher:", this.currentTeacher);
    return {
      titre: formData.get("titre"),
      type: formData.get("type"),
      classId: parseInt(formData.get("classId")),
      subjectId: parseInt(formData.get("subjectId")),
      date_evaluation: rawDate ? new Date(rawDate).toISOString() : null,
      trimestreId: parseInt(formData.get("trimestreId")),
      anneeScolaireId: parseInt(formData.get("anneeScolaireId")),
      teacherId: this.currentTeacher.id,
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
