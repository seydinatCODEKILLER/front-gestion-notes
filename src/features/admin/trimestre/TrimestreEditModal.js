import { AbstractTrimestreModal } from "./AbstractTrimestreModal.js";

export class TrimestreEditModal extends AbstractTrimestreModal {
  constructor(app, trimestre, options = {}) {
    super(app, {
      title: "Modifier le trimestre",
      trimestre,
    });
    this.trimestre = trimestre;
    this.options = options;
  }

  initForm() {
    if (!this.trimestre) return;

    this.form.querySelector('[name="libelle"]').value =
      this.trimestre.libelle || "";
    this.form.querySelector('[name="anneeScolaireId"]').value =
      this.trimestre.anneeScolaireId || "";
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    await this.controller.updateTrimestre(this.trimestre.id, formData);
    this.app.eventBus.publish("trimestres:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
