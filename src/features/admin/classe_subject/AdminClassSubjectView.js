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
  }

  async render() {
    this.container = document.createElement("div");
    this.container.className = "admin-class-subject-view p-4 space-y-6";

    await this._setup();
    return this.container;
  }

  async _setup() {
    try {
      [this.classes, this.anneeScolaireActive] = await Promise.all([
        this.controller.getAllClasses(),
        this.controller.getAnneeScolaireActive(),
      ]);
      this._createBanner();
      this._renderContent();
    } catch (error) {
      console.error("Erreur de chargement des classes :", error);
      this.app.services.notifications.show(
        error.message ||
          "Une erreur est survenue lors du chargement des classes",
        "error"
      );
    }
  }

  _createBanner() {
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

  _renderContent() {
    if (this.content) this.content.remove();
    this.content = document.createElement("div");
    this.content.className = "p-6";
    this.container.appendChild(this.content);

    if (!this.anneeScolaireActive) {
      const warning = document.createElement("div");
      warning.className = "alert alert-warning";
      warning.innerHTML = `
        <i class="ri-alert-line"></i>
        <span>Aucune année scolaire active. Veuillez d'abord activer une année scolaire.</span>
      `;
      this.content.appendChild(warning);
      return;
    }

    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        {
          header: "Classe",
          render: (c) => {
            const span = document.createElement("span");
            span.textContent = c.nom || "N/A";
            return span;
          },
          sortable: true,
        },
        {
          header: "Niveau",
          render: (c) => {
            const span = document.createElement("span");
            span.textContent = c.niveau?.libelle || "N/A";
            return span;
          },
          sortable: true,
        },
        {
          header: "Effectif",
          render: (c) => {
            const span = document.createElement("span");
            span.textContent = c._count?.students || "0";
            return span;
          },
        },
        {
          header: "Capacité",
          render: (c) => {
            const span = document.createElement("span");
            span.textContent = c.capacite_max || "0";
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
        this._handleClassAction(action, id, actionType),
    });

    this.content.appendChild(table.render());
    table.update(this.classes, 1);
  }

  async _handleClassAction(action, classId, actionType) {
    const classe = this.classes.find((c) => c.id == classId);
    if (!classe) return;

    try {
      switch (action) {
        case "viewDetails":
          await this._viewDetails(classe);
          break;
        case "assignSubjects":
          await this._assignSubjects(classe);
          break;
        default:
          console.warn(`Action non gérée: ${action}`);
      }
    } catch (error) {
      this._handleActionError(error);
    }
  }

  async _viewDetails(classe) {
    const modal = new ClassDetailsModal(
      this.app,
      classe,
      this.anneeScolaireActive
    );
    await modal.open();
  }

  async _assignSubjects(classe) {
    const modal = new AssignClassSubjectsModal(
      this.app,
      classe,
      this.anneeScolaireActive,
      {
        onSave: () => this.app.eventBus.publish("class-subjects:updated"),
      }
    );
    await modal.open();
  }

  _handleActionError(error) {
    console.error("Erreur lors de la gestion de l'action :", error);
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
