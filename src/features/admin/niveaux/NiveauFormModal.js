import { AbstractNiveauModal } from "@features/admin/niveaux/AbstractNiveauModal";

export class NiveauFormModal extends AbstractNiveauModal {
  constructor(app, existingNiveaux = [], options = {}) {
    super(app, {
      title: "Ajouter un niveau",
    });
    this.existingNiveaux = existingNiveaux;
    this.options = options;
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createNiveau(formData);
    this.app.eventBus.publish("niveaux:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
