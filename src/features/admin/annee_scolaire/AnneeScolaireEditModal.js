import { AbstractAnneeScolaireModal } from "./AbstractAnneeScolaireModal.js";

export class AnneeScolaireEditModal extends AbstractAnneeScolaireModal {
  constructor(app, anneeScolaire, options = {}) {
    super(app, {
      title: "Modifier l'année scolaire",
      anneeScolaire,
    });
    this.anneeScolaire = anneeScolaire;
    this.options = options;
  }

  initForm() {
    if (!this.anneeScolaire) return;

    this.form.querySelector('[name="libelle"]').value =
      this.anneeScolaire.libelle || "";
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    await this.controller.updateAnneeScolaire(this.anneeScolaire.id, formData);
    this.app.eventBus.publish("annees_scolaires:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
