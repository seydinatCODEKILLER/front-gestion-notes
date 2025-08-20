import { AbstractClassModal } from "./AbstractClassModal.js";

export class ClassEditModal extends AbstractClassModal {
  constructor(app, classe, options = {}) {
    super(app, {
      title: "Modifier la classe",
      classe,
    });
    this.classe = classe;
    this.options = options;
  }

  initForm() {
    if (!this.classe) return;

    this.form.querySelector('[name="nom"]').value = this.classe.nom || "";
    this.form.querySelector('[name="capacite_max"]').value =
      this.classe.capacite_max || "";
    this.form.querySelector('[name="niveauId"]').value =
      this.classe.niveauId || "";
    this.form.querySelector('[name="anneeScolaireId"]').value =
      this.classe.anneeScolaireId || "";
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    await this.controller.updateClass(this.classe.id, formData);
    this.app.eventBus.publish("classes:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
