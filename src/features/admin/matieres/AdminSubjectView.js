import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { SubjectCard } from "@/components/card/SubjectCard.js";
import { ModernTable } from "@/components/table/Table.js";
import { FloatingActionButton } from "@/components/button/FloatingButton.js";
import { Modal } from "@/components/modal/Modal.js";
import { SubjectFormModal } from "./SubjectFormModal.js";
import { SubjectEditModal } from "./SubjectEditModal.js";

export class AdminSubjectView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("subjects");
    this.currentView = "cards";
    this.localSubjects = [];

    this.formModal = new SubjectFormModal(app, this.localSubjects, {
      onSave: async () => {
        this.localSubjects = await this.controller.loadSubjects(true);
        this.renderContent();
      },
    });
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      this.localSubjects = await this.controller.loadSubjects();
      console.log(this.localSubjects);
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      this.showError("Erreur de chargement des matières");
    }
  }

  createBanner() {
    const activeSubjects = this.localSubjects.filter(
      (s) => s.statut === "actif"
    );

    const bannerConfig = {
      title: "Gestion des matières",
      subtitle: "Ajoutez, modifiez et activez/désactivez vos matières",
      primaryText: `${this.localSubjects.length} matière(s) enregistrée(s)`,
      secondaryText: `${activeSubjects.length} matière(s) active(s)`,
      icon: '<i class="ri-book-line text-2xl text-blue-600"></i>',
      variant: "default",
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

  renderCardsView(container) {
    const cards = new SubjectCard({
      data: this.localSubjects,
      itemsPerPage: 8,
      actions: {
        items: [
          {
            name: "edit",
            label: "Modifier",
            icon: "ri-edit-line",
            visible: (item) => item.statut === "actif",
          },
          {
            name: "toggleStatus",
            label: (item) =>
              item.statut === "actif" ? "Désactiver" : "Activer",
            icon: (item) =>
              item.statut === "actif" ? "ri-close-line" : "ri-check-line",
            className: (item) =>
              item.statut === "actif" ? "btn-error" : "btn-success",
            action: (item) => (item.statut === "actif" ? "disable" : "enable"),
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleSubjectAction(action, id, actionType),
    });

    container.appendChild(cards.render());
  }

  renderTableView(container) {
    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        {
          header: "Nom",
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
          key: "niveau.nom",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.niveau?.nom || "N/A";
            return span;
          },
        },
        {
          header: "Coefficient",
          key: "coefficient",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.coefficient || "N/A";
            return span;
          },
        },
        {
          header: "Statut",
          key: "statut",
          render: (item) => {
            const badge = document.createElement("span");
            badge.className =
              "badge " +
              (item.statut === "actif" ? "badge-success" : "badge-warning");
            badge.textContent = item.statut === "actif" ? "Actif" : "Inactif";
            return badge;
          },
        },
      ],
      data: this.localSubjects,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "edit",
            icon: "ri-edit-line",
            className: "btn-primary",
            visible: (item) => item.statut === "actif",
          },
          {
            name: "toggleStatus",
            icon: (item) =>
              item.statut === "actif" ? "ri-close-line" : "ri-check-line",
            className: (item) =>
              item.statut === "actif" ? "btn-error" : "btn-success",
            action: (item) => (item.statut === "actif" ? "disable" : "enable"),
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleSubjectAction(action, id, actionType),
    });

    container.appendChild(table.render());
    setTimeout(() => {
      table.update(this.localSubjects, 1);
    }, 0);
  }

  initFloatingButton() {
    this.fab = new FloatingActionButton({
      icon: "ri-add-line",
      color: "primary",
      position: "bottom-right",
      size: "lg",
      onClick: () => {
        this.formModal.open();
      },
    });
  }

  async handleSubjectAction(action, id, actionType) {
    const subject = this.findSubjectById(id);
    if (!subject) return;
    try {
      switch (action) {
        case "edit":
          await this.handleEditAction(subject);
          break;
        case "toggleStatus":
          await this.handleStatusToggle(id, actionType);
          break;
        default:
          console.warn(`Action non gérée: ${action}`);
      }
    } catch (error) {
      this.handleActionError(error);
    }
  }

  findSubjectById(id) {
    return this.localSubjects.find((s) => s.id == id);
  }

  async handleEditAction(subject) {
    const modal = new SubjectEditModal(this.app, subject, {
      onSave: async () => {
        this.localSubjects = await this.controller.loadSubjects(true);
        this.renderContent();
      },
    });
    await modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDisableAction = actionType === "disable";
    const confirmed = await this.showConfirmation(
      isDisableAction ? "Désactiver cette matière ?" : "Activer cette matière ?"
    );

    if (!confirmed) return;

    try {
      if (isDisableAction) {
        await this.controller.deleteSubject(id);
      } else {
        await this.controller.restoreSubject(id);
      }

      // Recharger les données
      this.localSubjects = await this.controller.loadSubjects(true);
      this.renderContent();
    } catch (error) {
      this.handleActionError(error);
    }
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
