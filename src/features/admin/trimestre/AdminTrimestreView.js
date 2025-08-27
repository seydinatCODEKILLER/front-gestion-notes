import { TrimestreCard } from "@/components/card/TrimestreCard.js";
import { TrimestreFormModal } from "./TrimestreFormModal.js";
import { ModernTable } from "@/components/table/Table.js";
import { TrimestreEditModal } from "./TrimestreEditModal.js";
import { FloatingActionButton } from "@/components/button/FloatingButton.js";
import { Modal } from "@/components/modal/Modal.js";
import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";

export class AdminTrimestreView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("trimestres");
    this.currentView = "cards";
    this.localTrimestres = [];

    this.formModal = new TrimestreFormModal(app, this.localTrimestres, {
      onSave: async () => await this._refreshTrimestres(),
    });
  }

  async render() {
    // Création d'un conteneur frais à chaque rendu
    this.container = document.createElement("div");
    this.container.className = "admin-trimestre-view p-4 space-y-6";

    await this._setup();
    return this.container;
  }

  async _setup() {
    try {
      this.localTrimestres = await this.controller.loadTrimestres();
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      console.error("Erreur lors du chargement des trimestres:", error);
      this.handleActionError(error);
    }
  }

  async _refreshTrimestres() {
    this.localTrimestres = await this.controller.loadTrimestres(true);
    this.renderContent();
  }

  createBanner() {
    const activeTrimestres = this.localTrimestres.filter(
      (t) => t.statut === "actif"
    );

    const bannerConfig = {
      title: "Gestion des trimestres",
      subtitle: "Ajoutez, modifiez et activez/désactivez vos trimestres",
      primaryText: `${this.localTrimestres.length} trimestre(s) enregistré(s)`,
      secondaryText:
        activeTrimestres.length > 0
          ? `${activeTrimestres.length} trimestre(s) actif(s)`
          : "Aucun trimestre actif",
      icon: '<i class="ri-calendar-2-line text-2xl text-purple-600"></i>',
      variant: "default",
      closable: true,
      timer: null,
    };

    this.banner = new Banner(bannerConfig);
    this.container.appendChild(this.banner.render());
  }

  renderViewToggle() {
    this.viewButtons = {};
    this.toggleGroup = document.createElement("div");
    this.toggleGroup.className =
      "view-toggle-group flex rounded-lg mb-6 overflow-hidden px-3 mt-4";
    this.container.appendChild(this.toggleGroup);

    ["cards", "table"].forEach((viewType) => {
      const button = document.createElement("button");
      button.className = this.getToggleButtonClass(viewType);
      button.innerHTML =
        viewType === "cards"
          ? '<i class="ri-grid-fill mr-2"></i>Cartes'
          : '<i class="ri-table-fill mr-2"></i>Tableau';

      this.viewButtons[viewType] = button;
      button.addEventListener("click", () => this.switchView(viewType));
      this.toggleGroup.appendChild(button);
    });
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

  renderContent() {
    // Crée un conteneur frais pour éviter les doublons
    if (this.content) this.content.remove();
    this.content = document.createElement("div");
    this.content.id = "content-container";
    this.container.appendChild(this.content);

    if (this.currentView === "cards") {
      this.renderCardsView(this.content);
    } else {
      this.renderTableView(this.content);
    }
  }

  renderCardsView(container) {
    const cardsWrapper = document.createElement("div");
    const cards = new TrimestreCard({
      itemsPerPage: 8,
      data: this.localTrimestres,
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
        this.handleTrimestreAction(action, id, actionType),
    });

    cardsWrapper.appendChild(cards.render());
    container.appendChild(cardsWrapper);
  }

  renderTableView(container) {
    const tableWrapper = document.createElement("div");
    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        { header: "Libellé", key: "libelle", sortable: true },
        {
          header: "Année scolaire",
          key: "annee_scolaire.libelle",
          sortable: true,
          render: (item) => item.annee_scolaire?.libelle || "N/A",
        },
        {
          header: "Statut",
          key: "statut",
          render: (item) =>
            `<span class="badge badge-${
              item.statut === "actif" ? "success" : "warning"
            }">${item.statut === "actif" ? "Actif" : "Inactif"}</span>`,
        },
      ],
      data: this.localTrimestres,
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
        this.handleTrimestreAction(action, id, actionType),
    });

    tableWrapper.appendChild(table.render());
    container.appendChild(tableWrapper);
    table.update(this.localTrimestres, 1);
  }

  initFloatingButton() {
    this.fab = new FloatingActionButton({
      icon: "ri-add-line",
      color: "primary",
      position: "bottom-right",
      size: "lg",
      onClick: () => this.formModal.open(),
    });
  }

  async handleTrimestreAction(action, id, actionType) {
    const trimestre = this.localTrimestres.find((t) => t.id == id);
    if (!trimestre) return;

    try {
      if (action === "edit") {
        await this.handleEditAction(trimestre);
      } else if (action === "toggleStatus") {
        await this.handleStatusToggle(id, actionType);
      } else {
        console.warn(`Action non gérée: ${action}`);
      }
    } catch (error) {
      this.handleActionError(error);
    }
  }

  async handleEditAction(trimestre) {
    const modal = new TrimestreEditModal(this.app, trimestre, {
      onSave: async () => await this._refreshTrimestres(),
    });
    await modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDisable = actionType === "disable";
    const confirmed = await this.showConfirmation(
      isDisable ? "Désactiver ce trimestre ?" : "Activer ce trimestre ?"
    );
    if (!confirmed) return;

    try {
      if (isDisable) await this.controller.deleteTrimestre(id);
      else await this.controller.restoreTrimestre(id);

      await this._refreshTrimestres();
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

  getToggleButtonClass(viewType) {
    return `px-4 py-2 transition duration-150 ${
      this.currentView === viewType
        ? "bg-primary text-white"
        : "bg-white hover:bg-base-200"
    }`;
  }

  beforeDestroy() {
    this.fab?.remove?.();
    this.formModal?.close();
    if (this.banner) this.banner.close();
    if (this.content) this.content.remove();
    if (this.toggleGroup) this.toggleGroup.remove();
  }

  destroy() {
    this.beforeDestroy();
    this.container.innerHTML = "";
  }
}
