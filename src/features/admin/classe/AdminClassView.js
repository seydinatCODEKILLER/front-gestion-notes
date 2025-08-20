import { ClassCard } from "@/components/card/ClassCard.js";
import { ClassFormModal } from "./ClassFormModal.js";
import { ModernTable } from "@/components/table/Table.js";
import { ClassEditModal } from "./ClassEditModal.js";
import { FloatingActionButton } from "@/components/button/FloatingButton.js";
import { Modal } from "@/components/modal/Modal.js";
import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";

export class AdminClassView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("classes");
    this.currentView = "cards";
    this.localClasses = [];

    this.formModal = new ClassFormModal(app, this.localClasses, {
      onSave: async () => {
        this.localClasses = await this.controller.loadClasses(true);
        this.renderContent();
      },
    });
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      this.localClasses = await this.controller.loadClasses();
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      this.showError("Erreur de chargement des classes");
    }
  }

  createBanner() {
    const activeClasses = this.localClasses.filter((c) => c.statut === "actif");

    const bannerConfig = {
      title: "Gestion des classes",
      subtitle: "Ajoutez, modifiez et activez/désactivez vos classes",
      primaryText: `${this.localClasses.length} classe(s) enregistrée(s)`,
      secondaryText: `${activeClasses.length} classe(s) active(s)`,
      icon: '<i class="ri-door-line text-2xl text-green-600"></i>',
      variant: "success",
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
    const cards = new ClassCard({
      itemsPerPage: 8,
      data: this.localClasses,
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
        this.handleClassAction(action, id, actionType),
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
          header: "Année scolaire",
          key: "annee_scolaire.libelle",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.anneeScolaire?.libelle || "N/A";
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
      data: this.localClasses,
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
        this.handleClassAction(action, id, actionType),
    });

    container.appendChild(table.render());
      table.update(this.localClasses, 1);
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

  async handleClassAction(action, id, actionType) {
    const classe = this.findClassById(id);
    if (!classe) return;
    try {
      switch (action) {
        case "edit":
          await this.handleEditAction(classe);
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

  findClassById(id) {
    return this.localClasses.find((c) => c.id == id);
  }

  async handleEditAction(classe) {
    const modal = new ClassEditModal(this.app, classe, {
      onSave: async () => {
        this.localClasses = await this.controller.loadClasses(true);
        this.renderContent();
      },
    });
    await modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDisableAction = actionType === "disable";
    const confirmed = await this.showConfirmation(
      isDisableAction ? "Désactiver cette classe ?" : "Activer cette classe ?"
    );

    if (!confirmed) return;

    try {
      if (isDisableAction) {
        await this.controller.deleteClass(id);
      } else {
        await this.controller.restoreClass(id);
      }

      // Recharger les données
      this.localClasses = await this.controller.loadClasses(true);
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
