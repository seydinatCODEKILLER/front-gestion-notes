import { AbstractSubjectModal } from "./AbstractSubjectModal.js";

export class SubjectFormModal extends AbstractSubjectModal {
  constructor(app, existingSubjects = [], options = {}) {
    super(app, {
      title: "Ajouter une matière",
    });
    this.existingSubjects = existingSubjects;
    this.options = options;
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createSubject(formData);
    this.app.eventBus.publish("subjects:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
