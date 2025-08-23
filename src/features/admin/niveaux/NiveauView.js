import { NiveauCard } from "@/components/card/NiveauCard.js";
import { NiveauFormModal } from "./NiveauFormModal.js";
import { ModernTable } from "@/components/table/Table.js";
import { NiveauEditModal } from "./NiveauEditModal.js";
import { FloatingActionButton } from "@/components/button/FloatingButton.js";
import { Modal } from "@/components/modal/Modal.js";
import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";


export class AdminNiveauView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("niveaux");
    this.currentView = "cards";
    this.localNiveaux = [];

    // Injection du callback onSave pour forcer le refresh après ajout
    this.formModal = new NiveauFormModal(app, this.localNiveaux, {
      onSave: async () => {
        this.localNiveaux = await this.controller.loadNiveaux(true);
        this.renderContent();
      },
    });
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      this.localNiveaux = await this.controller.loadNiveaux();
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      console.log(error)
      // this.showError("Erreur de chargement des niveaux");
    }
  }

  createBanner() {
    const bannerConfig = {
      title: "Gestion des niveaux",
      subtitle: "Ajoutez, modifiez et activez/désactivez vos niveaux",
      primaryText: `${this.localNiveaux.length} niveau(x) enregistré(s)`,
      secondaryText: `Dernière mise à jour: ${new Date().toLocaleDateString()}`,
      icon: '<i class="ri-graduation-cap-line text-2xl text-blue-600"></i>',
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
    const cards = new NiveauCard({
      itemsPerPage: 8,
      data: this.localNiveaux,
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
        this.handleNiveauAction(action, id, actionType),
    });

    container.appendChild(cards.render());
  }

  renderTableView(container) {
    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        {
          header: "Libellé",
          key: "libelle",
          sortable: true,
        },
        {
          header: "Statut",
          key: "statut",
          render: (item) => {
            return `<span class="badge badge-${
              item.statut === "actif" ? "success" : "warning"
            }">${item.statut === "actif" ? "Actif" : "Inactif"}</span>`;
          },
        },
      ],
      data: this.localNiveaux,
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
        this.handleNiveauAction(action, id, actionType),
    });

    container.appendChild(table.render());
    table.update(this.localNiveaux, 1);
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

  async handleNiveauAction(action, id, actionType) {
    const niveau = this.findNiveauById(id);
    if (!niveau) return;
    try {
      switch (action) {
        case "edit":
          await this.handleEditAction(niveau);
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

  findNiveauById(id) {
    return this.localNiveaux.find((n) => n.id == id);
  }

  async handleEditAction(niveau) {
    const modal = new NiveauEditModal(this.app, niveau, {
      onSave: async () => {
        this.localNiveaux = await this.controller.loadNiveaux(true);
        this.renderContent();
      },
    });
    modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDisableAction = actionType === "disable";
    const confirmed = await this.showConfirmation(
      isDisableAction ? "Désactiver ce niveau ?" : "Activer ce niveau ?"
    );

    if (!confirmed) return;

    try {
      if (isDisableAction) {
        await this.controller.deleteNiveau(id);
      } else {
        await this.controller.restoreNiveau(id);
      }

      // Recharger les données
      this.localNiveaux = await this.controller.loadNiveaux(true);
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
