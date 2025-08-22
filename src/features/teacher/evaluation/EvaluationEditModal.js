import { AbstractEvaluationModal } from "./AbstractEvaluationModal.js";

export class EvaluationEditModal extends AbstractEvaluationModal {
  constructor(app, evaluation, options = {}) {
    super(app, {
      title: "Modifier l'évaluation",
      evaluation,
    });
    this.evaluation = evaluation;
    this.options = options;
  }

  initForm() {
    if (!this.evaluation) return;

    this.form.querySelector('[name="titre"]').value =
      this.evaluation.titre || "";
    this.form.querySelector('[name="type"]').value = this.evaluation.type || "";
    this.form.querySelector('[name="classId"]').value =
      this.evaluation.classId || "";
    this.form.querySelector('[name="subjectId"]').value =
      this.evaluation.subjectId || "";
    this.form.querySelector('[name="date_evaluation"]').value = this.evaluation
      .date_evaluation
      ? new Date(this.evaluation.date_evaluation).toISOString().split("T")[0]
      : "";
    this.form.querySelector('[name="trimestreId"]').value =
      this.evaluation.trimestreId || "";
    this.form.querySelector('[name="anneeScolaireId"]').value =
      this.evaluation.anneeScolaireId || "";
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    await this.controller.updateEvaluation(this.evaluation.id, formData);
    this.app.eventBus.publish("evaluations:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
