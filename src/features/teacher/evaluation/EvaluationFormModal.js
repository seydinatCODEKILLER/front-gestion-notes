import { AbstractEvaluationModal } from "./AbstractEvaluationModal.js";

export class EvaluationFormModal extends AbstractEvaluationModal {
  constructor(app, existingEvaluations = [], options = {}) {
    super(app, {
      title: "Ajouter une évaluation",
    });
    this.existingEvaluations = existingEvaluations;
    this.options = options;
  }

  getSubmitButtonText() {
    return "Enregistrer";
  }

  async processFormData(formData) {
    await this.controller.createEvaluation(formData);
    this.app.eventBus.publish("evaluations:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
