import { AbstractStudentModal } from "./AbstractStudentModal.js";

export class StudentEditModal extends AbstractStudentModal {
  constructor(app, student, options = {}) {
    super(app, {
      title: "Modifier l'élève",
      student,
      requirePassword: false,
    });
    this.student = student;
    this.options = options;
  }

  initForm() {
    if (!this.student) return;

    const user = this.student.user || {};

    this.form.querySelector('[name="nom"]').value = user.nom || "";
    this.form.querySelector('[name="prenom"]').value = user.prenom || "";
    this.form.querySelector('[name="telephone"]').value = user.telephone || "";
    this.form.querySelector('[name="adresse"]').value = user.adresse || "";
    this.form.querySelector('[name="email"]').value = user.email || "";
    this.form.querySelector('[name="date_naissance"]').value = this.student
      .date_naissance
      ? new Date(this.student.date_naissance).toISOString().split("T")[0]
      : "";
    this.form.querySelector('[name="lieu_naissance"]').value =
      this.student.lieu_naissance || "";

    // Pré-selectionner la classe si elle existe
    if (this.student.classId) {
      const classe = this.classes.find((c) => c.id === this.student.classId);
      if (classe) {
        // Déclencher la mise à jour des classes
        setTimeout(() => {
          this.form.querySelector('[name="classId"]').value =
            this.student.classId;
        }, 100);
      }
    }

    if (user.avatar) {
      const preview = this.form.querySelector("#avatar-preview");
      const previewContainer = this.form.querySelector(".avatar-preview");
      preview.src = user.avatar;
      previewContainer.classList.remove("hidden");
    }
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    await this.controller.updateStudent(this.student.id, formData);
    this.app.eventBus.publish("students:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
