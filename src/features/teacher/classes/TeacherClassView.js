import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { ModernTable } from "@/components/table/Table.js";
import { ClassDetailsModal } from "./ClassDetailsModal.js";

export class TeacherClassView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("classes");
    this.teacherClasses = [];
    this.currentTeacher = this.app.getService("auth").getCurrentUser();
    this.setup();
  }

  async setup() {
    try {
      this.container.innerHTML = "";

      if (!this.currentTeacher) {
        this.showError("Utilisateur non connecté");
        return;
      }

      this.teacherClasses = await this.controller.loadTeacherClasses(
        this.currentTeacher.id
      );
      console.log(this.teacherClasses)
      this.createBanner();
      this.renderContent();
    } catch (error) {
    console.log(error)
    }
  }

  createBanner() {
    const bannerConfig = {
      title: "Mes Classes",
      subtitle: "Classes assignées pour l'année en cours",
      primaryText: `${this.teacherClasses.length} classe(s) assignée(s)`,
      secondaryText: `Professeur: ${this.currentTeacher.prenom} ${this.currentTeacher.nom}`,
      icon: '<i class="ri-door-line text-2xl text-blue-600"></i>',
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

    if (this.teacherClasses.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "text-center p-8 text-gray-500";
      emptyMessage.innerHTML = `
        <i class="ri-door-line text-4xl mb-2"></i>
        <p>Aucune classe assignée</p>
        <p class="text-sm mt-2">Contactez l'administration pour être assigné à des classes</p>
      `;
      content.appendChild(emptyMessage);
      this.container.appendChild(content);
      return;
    }

    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        {
          header: "Classe",
          key: "nom",
          sortable: true,
        },
        {
          header: "Niveau",
          key: "niveau.libelle",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.niveau?.libelle || "N/A";
            return span;
          },
        },
        {
          header: "Effectif",
          key: "_count.students",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item._count.students || "0";
            return span;
          },
        },
        {
          header: "Capacité",
          key: "capacite_max",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.capacite_max || "∞";
            return span;
          },
        },
        {
          header: "Année scolaire",
          key: "annee_scolaire.libelle",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.anneeScolaire?.libelle || "N/A";
            return span;
          },
        },
      ],
      data: this.teacherClasses,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "viewDetails",
            icon: "ri-eye-line",
            className: "btn-primary",
            label: "Voir détails",
          },
        ],
      },
      onAction: (action, id) => this.handleClassAction(action, id),
    });

    content.appendChild(table.render());
    this.container.appendChild(content);
    setTimeout(() => {
        table.update(this.teacherClasses)
    },0)
  }

  async handleClassAction(action, classId) {
    const classe = this.findClassById(classId);
    if (!classe) return;

    try {
      if (action === "viewDetails") {
        await this.handleViewDetails(classe);
      }
    } catch (error) {
      this.handleActionError(error);
    }
  }

  findClassById(id) {
    return this.teacherClasses.find((c) => c.id == id);
  }

  async handleViewDetails(classe) {
    const modal = new ClassDetailsModal(this.app, classe);
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
