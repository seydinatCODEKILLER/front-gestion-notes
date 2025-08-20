import { AbstractStudentModal } from "./AbstractStudentModal.js";

export class StudentFormModal extends AbstractStudentModal {
  constructor(app, existingStudents = [], options = {}) {
    super(app, {
      title: "Ajouter un élève",
      requirePassword: true,

    });
    this.existingStudents = existingStudents;
    this.options = options;
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createStudent(formData);
    this.app.eventBus.publish("students:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
