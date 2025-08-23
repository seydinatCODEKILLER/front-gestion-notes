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
    this.setup();
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      this.teachers = await this.controller.getAllTeachers();
      this.createBanner();
      this.renderContent();
    } catch (error) {
      console.log(error)
      // this.showError("Erreur de chargement des professeurs");
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
    const content = document.createElement("div");
    content.className = "p-6";

    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        {
          header: "Nom",
          key: "user.nom",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.user?.nom || "N/A";
            return span;
          },
        },
        {
          header: "Prénom",
          key: "user.prenom",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.user?.prenom || "N/A";
            return span;
          },
        },
        {
          header: "Email",
          key: "user.email",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.user?.email || "N/A";
            return span;
          },
        },
        {
          header: "Spécialité",
          key: "specialite",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.specialite || "Non spécifié";
            return span;
          },
        },
        {
          header: "Statut",
          key: "user.statut",
          render: (item) => {
            const badge = document.createElement("span");
            badge.className =
              "badge " +
              (item.user?.statut === "actif"
                ? "badge-success"
                : "badge-warning");
            badge.textContent =
              item.user?.statut === "actif" ? "Actif" : "Inactif";
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
            visible: (item) => item.user?.statut === "actif",
          },
        ],
      },
      onAction: async (action, id, actionType) =>
        await this.handleTeacherAction(action, id, actionType),
    });

    content.appendChild(table.render());
    this.container.appendChild(content);
    setTimeout(() => {
        table.update(this.teachers,1);
    }, 0);
  }

  async handleTeacherAction(action, teacherId, actionType) {
    const teacher = this.findTeacherById(teacherId);
    if (!teacher) return;

    try {
      switch (action) {
        case "viewDetails":
          await this.handleViewDetails(teacher);
          break;
        case "assignSubjects":
          await this.handleAssignSubjects(teacher);
          break;
        default:
          console.warn(`Action non gérée: ${action}`);
      }
    } catch (error) {
      this.handleActionError(error);
    }
  }

  findTeacherById(id) {
    return this.teachers.find((t) => t.id == id);
  }

  async handleViewDetails(teacher) {
    const modal = new TeacherDetailsModal(this.app, teacher);
    await modal.open();
  }

  async handleAssignSubjects(teacher) {
    const modal = new AssignSubjectsModal(this.app, teacher, {
      onSave: async () => {
        // Recharger les données si nécessaire
        this.app.eventBus.publish("teacher-subjects:updated");
      },
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

  cleanup() {
    // Cleanup si nécessaire
  }
}
