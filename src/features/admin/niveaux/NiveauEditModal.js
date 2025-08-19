import { AbstractNiveauModal } from "@features/admin/niveaux/AbstractNiveauModal";

export class NiveauEditModal extends AbstractNiveauModal {
  constructor(app, niveau, options = {}) {
    super(app, {
      title: "Modifier le niveau",
      niveau,
    });
    this.niveau = niveau;
    this.options = options;
  }

  initForm() {
    if (!this.niveau) return;

    this.form.querySelector('[name="libelle"]').value =
      this.niveau.libelle || "";
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    await this.controller.updateNiveau(this.niveau.id, formData);
    this.app.eventBus.publish("niveaux:updated");
    this.app.eventBus.publish("niveaux:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
