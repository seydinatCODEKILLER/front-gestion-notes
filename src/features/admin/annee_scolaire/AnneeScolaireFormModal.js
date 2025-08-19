import { AbstractAnneeScolaireModal } from "./AbstractAnneeScolaireModal.js";

export class AnneeScolaireFormModal extends AbstractAnneeScolaireModal {
  constructor(app, existingAnnees = [], options = {}) {
    super(app, {
      title: "Ajouter une année scolaire",
    });
    this.existingAnnees = existingAnnees;
    this.options = options;
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createAnneeScolaire(formData);
    this.app.eventBus.publish("annees_scolaires:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
