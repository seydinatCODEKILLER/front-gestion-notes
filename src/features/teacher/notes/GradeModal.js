import { Modal } from "@/components/modal/Modal";
import { validators } from "@/utils/Validator";


export class GradeModal {
  constructor(app, evaluation, options = {}) {
    this.app = app;
    this.controller = app.getController("grades");
    this.evaluation = evaluation;
    this.options = options;
    this.students = [];
    this.existingGrades = [];
    this.isEditMode = options.isEditMode || false;
    this.init();
  }

  async init() {
    await this.loadStudents();
    await this.loadExistingGrades();
    this.createForm();
    this.setupModal();
    this.setupValidation();
    this.setupEvents();
    this.isInitialized = true;
  }

  async loadStudents() {
    try {
      const classes = await this.controller.getStudentsByClass(
        this.evaluation.classId
      );
      this.students = classes.students;
      console.log(this.students)
      this.students.sort(
        (a, b) =>
          a.user.nom.localeCompare(b.user.nom) ||
          a.user.prenom.localeCompare(b.user.prenom)
      );
    } catch (error) {
      console.error("Erreur lors du chargement des élèves:", error);
      this.students = [];
    }
  }

  async loadExistingGrades() {
    try {
      this.existingGrades = await this.controller.loadEvaluationGrades(
        this.evaluation.id
      );
      console.log(this.existingGrades)
    } catch (error) {
      console.error("Erreur lors du chargement des notes existantes:", error);
      this.existingGrades = [];
    }
  }

  createForm() {
    this.form = document.createElement("form");
    this.form.className = "space-y-4 max-h-96 overflow-y-auto";
    this.form.noValidate = true;
    this.form.innerHTML = this.getFormTemplate();
  }

  getFormTemplate() {
    const studentsList = this.students
      .map((student) => {
        const existingGrade = this.existingGrades.find(
          (g) => g.studentId == student.id
        );
        console.log(existingGrade)
        const noteValue = existingGrade?.note || "";

        return `
        <div class="flex items-center justify-between p-3 border-b border-base-200">
          <div class="flex-1">
            <div class="font-medium">${student.user.nom} ${
          student.user.prenom
        }</div>
            <div class="text-sm text-gray-500">${student.user.email}</div>
          </div>
          <div class="w-24">
            <input
              type="number"
              name="note_${student.id}"
              class="input input-bordered input-sm w-full"
              min="0"
              max="20"
              step="0.25"
              placeholder="0-20"
              value="${noteValue}"
              ${this.isEditMode ? "" : "required"}
            >
            <div data-error="note_${
              student.id
            }" class="text-error text-xs mt-1 hidden"></div>
          </div>
        </div>
      `;
      })
      .join("");

    return `
      <div class="mb-4">
        <h3 class="text-lg font-semibold">${this.evaluation.titre}</h3>
        <p class="text-sm text-gray-500">
          ${this.evaluation.subject.nom} - ${this.evaluation.class.nom}
        </p>
        <p class="text-sm text-gray-500">
          Date: ${new Date(
            this.evaluation.date_evaluation
          ).toLocaleDateString()}
        </p>
      </div>
      
      <div class="border rounded-lg divide-y">
        ${studentsList}
      </div>
      
      <div class="form-control mt-4">
        <label class="label cursor-pointer justify-start gap-3">
          <input type="checkbox" name="allowEmpty" class="checkbox checkbox-sm">
          <span class="label-text">Autoriser les notes vides</span>
        </label>
      </div>
    `;
  }

  setupModal() {
    this.modal = new Modal({
      title: this.isEditMode ? "Modifier les notes" : "Saisir les notes",
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
        text: this.isEditMode ? "Mettre à jour" : "Enregistrer",
        className: "btn-primary",
        action: "submit",
        onClick: (e) => this.handleSubmit(e),
        closeOnClick: false,
      },
    ];
  }

  setupValidation() {
    this.fields = {};

    this.students.forEach((student) => {
      this.fields[`note_${student.id}`] = {
        value: "",
        error: "",
        validator: (v) => {
          if (!v && !this.form.querySelector('[name="allowEmpty"]').checked) {
            return "La note est requise";
          }
          if (v && !validators.numberRange(v, 0, 20)) {
            return "La note doit être entre 0 et 20";
          }
          return true;
        },
      };
    });
  }

  setupEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    this.form.querySelectorAll('input[type="number"]').forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input.name));
      input.addEventListener("input", () => {
        if (this.fields[input.name]?.error) {
          this.clearError(input.name);
        }
      });
    });

    this.form
      .querySelector('[name="allowEmpty"]')
      .addEventListener("change", () => {
        this.validateAllFields();
      });
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!(await this.validateForm())) {
      return;
    }

    this.modal.setButtonLoading("submit", true, "Enregistrement...");

    try {
      const gradesData = this.getFormData();

      if (this.isEditMode) {
        await this.controller.updateGrades(gradesData);
      } else {
        await this.controller.createGrades(gradesData);
      }

      this.close();
      if (this.options?.onSave) {
        await this.options.onSave();
      }
    } catch (error) {
      this.handleSubmitError(error);
    } finally {
      this.modal.setButtonLoading("submit", false);
    }
  }

  getFormData() {
    const gradesData = [];
    const formData = new FormData(this.form);

    this.students.forEach((student) => {
      const noteValue = formData.get(`note_${student.id}`);
      if (noteValue || this.isEditMode) {
        const existingGrade = this.existingGrades.find(
          (g) => g.studentId == student.id
        );

        gradesData.push({
          id: existingGrade?.id,
          studentId: student.id,
          subjectId: this.evaluation.subjectId,
          evaluationId: this.evaluation.id,
          type_note: this.evaluation.type,
          trimestreId: this.evaluation.trimestreId,
          anneeScolaireId: this.evaluation.anneeScolaireId,
          note: noteValue ? parseFloat(noteValue) : null,
        });
      }
    });

    return gradesData;
  }

  handleSubmitError(error) {
    console.error("Erreur lors de l'enregistrement des notes:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue lors de l'enregistrement",
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

  validateAllFields() {
    Object.keys(this.fields).forEach((field) => this.validateField(field));
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
      await this.init();
    }

    this.modal.open();
  }

  close() {
    this.modal.close();
  }
}
