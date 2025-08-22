import { EvaluationCard } from "@/components/card/EvaluationCard.js";
import { ModernTable } from "@/components/table/Table.js";
import { Modal } from "@/components/modal/Modal.js";
import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { GradeModal } from "./GradeModal.js";

export class AdminEvaluationNoteView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("evaluations");
    this.currentTeacher = app.getService("auth").getCurrentUser();
    this.currentView = "cards";
    this.localEvaluations = [];
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      this.localEvaluations = await this.controller.loadEvaluations(true);
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      this.showError("Erreur de chargement des évaluations");
    }
  }

  createBanner() {
    const upcomingEvaluations = this.localEvaluations.filter(
      (e) => new Date(e.date_evaluation) >= new Date()
    );

    const bannerConfig = {
      title: "Gestion des évaluations",
      subtitle: "Planifiez et gérez les évaluations des élèves",
      primaryText: `${this.localEvaluations.length} évaluation(s) planifiée(s)`,
      secondaryText: `${upcomingEvaluations.length} évaluation(s) à venir`,
      icon: '<i class="ri-file-text-line text-2xl text-blue-600"></i>',
      variant: "info",
      closable: true,
      timer: null,
    };

    this.banner = new Banner(bannerConfig);
    this.container.insertBefore(
      this.banner.render(),
      this.container.firstChild
    );
  }

  closeBanner() {
    this.banner?.close();
  }

  switchView(viewType) {
    if (this.currentView !== viewType) {
      this.currentView = viewType;

      Object.entries(this.viewButtons).forEach(([type, button]) => {
        button.className = this.getToggleButtonClass(type);
      });
      this.renderContent();
    }
  }

  renderViewToggle() {
    this.viewButtons = {};

    const toggleGroup = document.createElement("div");
    toggleGroup.className =
      "view-toggle-group flex rounded-lg mb-6 overflow-hidden px-3 mt-4";

    ["cards", "table"].forEach((viewType) => {
      const button = document.createElement("button");
      button.className = this.getToggleButtonClass(viewType);
      button.innerHTML =
        viewType === "cards"
          ? '<i class="ri-grid-fill mr-2"></i>Cartes'
          : '<i class="ri-table-fill mr-2"></i>Tableau';

      this.viewButtons[viewType] = button;

      button.addEventListener("click", () => this.switchView(viewType));
      toggleGroup.appendChild(button);
    });

    this.container.appendChild(toggleGroup);
  }

  renderContent() {
    const content =
      this.container.querySelector("#content-container") ||
      document.createElement("div");

    content.id = "content-container";
    content.innerHTML = "";

    if (this.currentView === "cards") {
      this.renderCardsView(content);
    } else {
      this.renderTableView(content);
    }

    if (!this.container.querySelector("#content-container")) {
      this.container.appendChild(content);
    }
  }

  async handleGradeAction(evaluation, isEditMode = false) {
    const modal = new GradeModal(this.app, evaluation, {
      isEditMode,
      onSave: async () => {
        this.localEvaluations = await this.controller.loadEvaluations(
          true
        );
        this.renderContent();
      },
    });

    await modal.open();
  }

  renderCardsView(container) {
    const cards = new EvaluationCard({
      itemsPerPage: 8,
      data: this.localEvaluations,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "grade",
            label: "Noter",
            icon: "ri-pencil-line",
            className: "btn-success",
            action: "grade",
          },
          {
            name: "editGrades",
            label: "Modifier notes",
            icon: "ri-edit-2-line",
            className: "btn-warning",
            action: "editGrades",
          }
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleEvaluationAction(action, id, actionType),
    });

    container.appendChild(cards.render());
  }

  renderTableView(container) {
    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        {
          header: "Titre",
          key: "titre",
          sortable: true,
        },
        {
          header: "Type",
          key: "type",
          sortable: true,
          render: (item) => {
            const types = {
              devoir: "Devoir",
              composition: "Composition",
              oral: "Oral",
              projet: "Projet",
            };
            const span = document.createElement("span");
            span.textContent = types[item.type] || item.type;
            return span;
          },
        },
        {
          header: "Classe",
          key: "class.nom",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.class?.nom || "N/A";
            return span;
          },
        },
        {
          header: "Matière",
          key: "subject.nom",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.subject?.nom || "N/A";
            return span;
          },
        },
        {
          header: "Date",
          key: "date_evaluation",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = new Date(
              item.date_evaluation
            ).toLocaleDateString();
            return span;
          },
        },
        {
          header: "Trimestre",
          key: "trimestre.libelle",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.trimestre?.libelle || "N/A";
            return span;
          },
        },
        {
          header: "Statut",
          key: "date_evaluation",
          render: (item) => {
            const isPast = new Date(item.date_evaluation) < new Date();
            const badge = document.createElement("span");
            badge.className =
              "badge " + (isPast ? "badge-warning" : "badge-success");
            badge.textContent = isPast ? "Passée" : "À venir";
            return badge;
          },
        },
      ],
      data: this.localEvaluations,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "grade",
            label: "Noter",
            icon: "ri-pencil-line",
            className: "btn-success",
            action: "grade",
          },
          {
            name: "editGrades",
            label: "Modifier notes",
            icon: "ri-edit-2-line",
            className: "btn-warning",
            action: "editGrades",
          }
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleEvaluationAction(action, id, actionType),
    });

    container.appendChild(table.render());
    table.update(this.localEvaluations, 1);
  }

  async handleEvaluationAction(action, id, actionType) {
    const evaluation = this.findEvaluationById(id);
    if (!evaluation) return;
    try {
      switch (action) {
        case "grade": // Nouvelle action pour noter
          await this.handleGradeAction(evaluation, false);
          break;
        case "editGrades": // Nouvelle action pour modifier les notes
          await this.handleGradeAction(evaluation, true);
          break;
        default:
          console.warn(`Action non gérée: ${action}`);
      }
    } catch (error) {
      this.handleActionError(error);
    }
  }

  findEvaluationById(id) {
    return this.localEvaluations.find((e) => e.id == id);
  }

  handleActionError(error) {
    console.error("Erreur lors de la gestion de l'action:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue",
      "error"
    );
  }

  async showConfirmation(message) {
    return new Promise((resolve) => {
      Modal.confirm({
        title: "Confirmation",
        content: message,
        confirmText: "Confirmer",
        cancelText: "Annuler",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  cleanup() {
    if (this.fab) this.fab.destroy();
    if (this.formModal) this.formModal.close();
  }

  getToggleButtonClass(viewType) {
    return `px-4 py-2 transition duration-150 ${
      this.currentView === viewType
        ? "bg-primary text-white"
        : "bg-white hover:bg-base-200"
    }`;
  }
}
