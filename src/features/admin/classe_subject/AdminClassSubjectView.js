import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { ModernTable } from "@/components/table/Table.js";
import { ClassDetailsModal } from "./ClassDetailsModal.js";
import { AssignClassSubjectsModal } from "./AssignClassSubjectsModal.js";

export class AdminClassSubjectView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("classSubjects");
    this.classes = [];
    this.anneeScolaireActive = null;
    this.setup();
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      [this.classes, this.anneeScolaireActive] = await Promise.all([
        this.controller.getAllClasses(),
        this.controller.getAnneeScolaireActive(),
      ]);
      console.log(this.classes)
      this.createBanner();
      this.renderContent();
    } catch (error) {
      this.showError("Erreur de chargement des données");
    }
  }

  createBanner() {
    const bannerConfig = {
      title: "Gestion des Affectations Classe-Matière",
      subtitle: "Affectez des matières aux classes et assignez des professeurs",
      primaryText: `${this.classes.length} classe(s)`,
      secondaryText: this.anneeScolaireActive
        ? `Année scolaire: ${this.anneeScolaireActive.libelle}`
        : "Aucune année scolaire active",
      icon: '<i class="ri-building-line text-2xl text-blue-600"></i>',
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

    if (!this.anneeScolaireActive) {
      const warning = document.createElement("div");
      warning.className = "alert alert-warning";
      warning.innerHTML = `
        <i class="ri-alert-line"></i>
        <span>Aucune année scolaire active. Veuillez d'abord activer une année scolaire.</span>
      `;
      content.appendChild(warning);
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
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.nom || "N/A";
            return span;
          },
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
            span.textContent = item.capacite_max || "0";
            return span;
          },
        },
      ],
      data: this.classes,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "viewDetails",
            label: "Voir détails",
            icon: "ri-eye-line",
            className: "btn-info",
          },
          {
            name: "assignSubjects",
            label: "Affecter des matières",
            icon: "ri-screenshot-line",
            className: "btn-warning",
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleClassAction(action, id, actionType),
    });

    content.appendChild(table.render());
    this.container.appendChild(content);
    setTimeout(() => {
      table.update(this.classes, 1);
    }, 0);
  }

  async handleClassAction(action, classId, actionType) {
    const classe = this.findClassById(classId);
    if (!classe) return;

    try {
      switch (action) {
        case "viewDetails":
          await this.handleViewDetails(classe);
          break;
        case "assignSubjects":
          await this.handleAssignSubjects(classe);
          break;
        default:
          console.warn(`Action non gérée: ${action}`);
      }
    } catch (error) {
      this.handleActionError(error);
    }
  }

  findClassById(id) {
    return this.classes.find((c) => c.id == id);
  }

  async handleViewDetails(classe) {
    const modal = new ClassDetailsModal(
      this.app,
      classe,
      this.anneeScolaireActive
    );
    await modal.open();
  }

  async handleAssignSubjects(classe) {
    const modal = new AssignClassSubjectsModal(
      this.app,
      classe,
      this.anneeScolaireActive,
      {
        onSave: async () => {
          this.app.eventBus.publish("class-subjects:updated");
        },
      }
    );
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
