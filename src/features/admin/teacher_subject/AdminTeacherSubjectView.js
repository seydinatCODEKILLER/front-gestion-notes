import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { ModernTable } from "@/components/table/Table.js";
import { TeacherDetailsModal } from "./TeacherDetailsModal.js";
import { AssignSubjectsModal } from "./AssignSubjectsModal.js";

export class AdminTeacherSubjectView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("teacherSubjects");
    this.teachers = [];
  }

  async render() {
    this.container = document.createElement("div");
    this.container.className = "admin-teacher-subject-view p-4 space-y-6";

    await this._setup();
    return this.container;
  }

  async _setup() {
    try {
      this.teachers = await this.controller.getAllTeachers();
      this.createBanner();
      this.renderContent();
    } catch (error) {
      console.error("Erreur de chargement des professeurs:", error);
      this.handleActionError(error);
    }
  }

  createBanner() {
    const bannerConfig = {
      title: "Gestion des Affectations",
      subtitle: "Affectez des matières aux professeurs",
      primaryText: `${this.teachers.length} professeur(s)`,
      secondaryText: "Gestion des matières par professeur",
      icon: '<i class="ri-user-star-line text-2xl text-blue-600"></i>',
      variant: "default",
      closable: true,
      timer: null,
    };
    this.banner = new Banner(bannerConfig);
    this.container.appendChild(this.banner.render());
  }

  renderContent() {
    if (this.content) this.content.remove();
    this.content = document.createElement("div");
    this.content.className = "p-6";
    this.container.appendChild(this.content);

    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        { header: "Nom", render: (t) => t.user?.nom || "N/A" },
        { header: "Prénom", render: (t) => t.user?.prenom || "N/A" },
        { header: "Email", render: (t) => t.user?.email || "N/A" },
        { header: "Spécialité", render: (t) => t.specialite || "Non spécifié" },
        {
          header: "Statut",
          render: (t) => {
            const badge = document.createElement("span");
            badge.className =
              "badge " +
              (t.user?.statut === "actif" ? "badge-success" : "badge-warning");
            badge.textContent =
              t.user?.statut === "actif" ? "Actif" : "Inactif";
            return badge;
          },
        },
      ],
      data: this.teachers,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "viewDetails",
            label: "Voir détails",
            icon: "ri-eye-line",
            className: "btn-primary",
          },
          {
            name: "assignSubjects",
            label: "Affecter des matières",
            icon: "ri-screenshot-line",
            className: "btn-secondary",
            visible: (t) => t.user?.statut === "actif",
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleTeacherAction(action, id, actionType),
    });

    this.content.appendChild(table.render());
    table.update(this.teachers, 1);
  }

  async handleTeacherAction(action, teacherId, actionType) {
    const teacher = this.teachers.find((t) => t.id == teacherId);
    if (!teacher) return;

    try {
      if (action === "viewDetails") await this._viewDetails(teacher);
      else if (action === "assignSubjects") await this._assignSubjects(teacher);
      else console.warn(`Action non gérée: ${action}`);
    } catch (error) {
      this.handleActionError(error);
    }
  }

  async _viewDetails(teacher) {
    const modal = new TeacherDetailsModal(this.app, teacher);
    await modal.open();
  }

  async _assignSubjects(teacher) {
    const modal = new AssignSubjectsModal(this.app, teacher, {
      onSave: () => this.app.eventBus.publish("teacher-subjects:updated"),
    });
    await modal.open();
  }

  handleActionError(error) {
    console.error("Erreur lors de la gestion de l'action:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue",
      "error"
    );
  }

  beforeDestroy() {
    this.banner?.close();
    this.content?.remove();
  }

  destroy() {
    this.beforeDestroy();
    this.container.innerHTML = "";
  }
}
