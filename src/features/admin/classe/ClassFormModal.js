import { AbstractClassModal } from "./AbstractClassModal.js";

export class ClassFormModal extends AbstractClassModal {
  constructor(app, existingClasses = [], options = {}) {
    super(app, {
      title: "Ajouter une classe",
    });
    this.existingClasses = existingClasses;
    this.options = options;
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createClass(formData);
    this.app.eventBus.publish("classes:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
