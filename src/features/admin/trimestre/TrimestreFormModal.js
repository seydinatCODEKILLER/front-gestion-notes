import { AbstractTrimestreModal } from "./AbstractTrimestreModal.js";

export class TrimestreFormModal extends AbstractTrimestreModal {
  constructor(app, existingTrimestres = [], options = {}) {
    super(app, {
      title: "Ajouter un trimestre",
    });
    this.existingTrimestres = existingTrimestres;
    this.options = options;
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createTrimestre(formData);
    this.app.eventBus.publish("trimestres:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
