import { AbstractSubjectModal } from "./AbstractSubjectModal.js";

export class SubjectEditModal extends AbstractSubjectModal {
  constructor(app, subject, options = {}) {
    super(app, {
      title: "Modifier la matière",
      subject,
    });
    this.subject = subject;
    this.options = options;
  }

  initForm() {
    if (!this.subject) return;

    this.form.querySelector('[name="nom"]').value = this.subject.nom || "";
    this.form.querySelector('[name="niveauId"]').value =
      this.subject.niveauId || "";
    this.form.querySelector('[name="coefficient"]').value =
      this.subject.coefficient || "";
    this.form.querySelector('[name="description"]').value =
      this.subject.description || "";
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    await this.controller.updateSubject(this.subject.id, formData);
    this.app.eventBus.publish("subjects:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
