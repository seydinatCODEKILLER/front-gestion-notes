import { AbstractTeacherModal } from "./AbstractTeacherModal.js";

export class TeacherEditModal extends AbstractTeacherModal {
  constructor(app, teacher, options = {}) {
    super(app, {
      title: "Modifier le professeur",
      teacher,
      requirePassword: false,
    });
    this.teacher = teacher;
    this.options = options;
  }

  initForm() {
    if (!this.teacher) return;

    const user = this.teacher.user || {};

    this.form.querySelector('[name="nom"]').value = user.nom || "";
    this.form.querySelector('[name="prenom"]').value = user.prenom || "";
    this.form.querySelector('[name="email"]').value = user.email || "";
    this.form.querySelector('[name="telephone"]').value = user.telephone || "";
    this.form.querySelector('[name="adresse"]').value = user.adresse || "";
    this.form.querySelector('[name="specialite"]').value =
      this.teacher.specialite || "";
          this.form.querySelector('[name="date_embauche"]').value = this.teacher
            .date_embauche
            ? new Date(this.teacher.date_embauche).toISOString().split("T")[0]
            : "";

    if (user.avatar) {
      const preview = this.form.querySelector("#avatar-preview");
      const previewContainer = this.form.querySelector(".avatar-preview");
      preview.src = user.avatar;
      previewContainer.classList.remove("hidden");
    }
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    console.log(this.teacher);
    await this.controller.updateTeacher(this.teacher.id, formData);
    this.app.eventBus.publish("teachers:updated");
    if (this.options?.onSave) {
      await this.options.onSave();
    }
  }
}
