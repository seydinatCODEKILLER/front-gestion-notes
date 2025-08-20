import { AbstractTeacherModal } from "./AbstractTeacherModal.js";

export class TeacherFormModal extends AbstractTeacherModal {
  constructor(app, existingTeachers = [], options = {}) {
    super(app, {
      title: "Ajouter un professeur",
      requirePassword: true,
    });
    this.existingTeachers = existingTeachers;
    this.options = options;
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createTeacher(formData);
    this.app.eventBus.publish("teachers:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
