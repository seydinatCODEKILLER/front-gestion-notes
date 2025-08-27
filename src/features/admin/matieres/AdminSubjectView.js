import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { NormalSubjectCard } from "@/components/card/NormalSubjectCard.js";
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
      onSave: async () => await this._refreshSubjects(),
    });
  }

  async render() {
    this.container = document.createElement("div");
    this.container.className = "admin-subject-view p-4 space-y-6";

    await this._setup();
    return this.container;
  }

  async _setup() {
    try {
      this.localSubjects = await this.controller.loadSubjects();
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      console.error("Erreur de chargement des matières:", error);
      this.handleActionError(error);
    }
  }

  async _refreshSubjects() {
    this.localSubjects = await this.controller.loadSubjects(true);
    this.renderContent();
  }

  createBanner() {
    const activeSubjects = this.localSubjects.filter(
      (s) => s.statut === "actif"
    );
    const bannerConfig = {
      title: "Gestion des matières",
      subtitle: "Ajoutez, modifiez et activez/désactivez vos matières",
      primaryText: `${this.localSubjects.length} matière(s) enregistrée(s)`,
      secondaryText:
        activeSubjects.length > 0
          ? `${activeSubjects.length} matière(s) active(s)`
          : "Aucune matière active",
      icon: '<i class="ri-book-line text-2xl text-blue-600"></i>',
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
    if (this.content) this.content.remove();
    this.content = document.createElement("div");
    this.content.id = "content-container";
    this.container.appendChild(this.content);

    if (this.currentView === "cards") this.renderCardsView(this.content);
    else this.renderTableView(this.content);
  }

  renderCardsView(container) {
    const cards = new NormalSubjectCard({
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
    const isActive = (s) => s.statut === "actif";
    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        { header: "Nom", render: (item) => item.nom || "N/A" },
        { header: "Niveau", render: (item) => item.niveau?.nom || "N/A" },
        { header: "Coefficient", render: (item) => item.coefficient || "N/A" },
        {
          header: "Statut",
          render: (item) => {
            const badge = document.createElement("span");
            badge.className =
              "badge " + (isActive(item) ? "badge-success" : "badge-warning");
            badge.textContent = isActive(item) ? "Actif" : "Inactif";
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
            visible: isActive,
          },
          {
            name: "toggleStatus",
            icon: (s) => (isActive(s) ? "ri-close-line" : "ri-check-line"),
            className: (s) => (isActive(s) ? "btn-error" : "btn-success"),
            action: (s) => (isActive(s) ? "disable" : "enable"),
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleSubjectAction(action, id, actionType),
    });

    container.appendChild(table.render());
    table.update(this.localSubjects, 1);
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

  async handleSubjectAction(action, id, actionType) {
    const subject = this.localSubjects.find((s) => s.id == id);
    if (!subject) return;

    try {
      if (action === "edit") await this.handleEditAction(subject);
      else if (action === "toggleStatus")
        await this.handleStatusToggle(id, actionType);
      else console.warn(`Action non gérée: ${action}`);
    } catch (error) {
      this.handleActionError(error);
    }
  }

  async handleEditAction(subject) {
    const modal = new SubjectEditModal(this.app, subject, {
      onSave: async () => await this._refreshSubjects(),
    });
    await modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDisable = actionType === "disable";
    const confirmed = await this.showConfirmation(
      isDisable ? "Désactiver cette matière ?" : "Activer cette matière ?"
    );
    if (!confirmed) return;

    try {
      if (isDisable) await this.controller.deleteSubject(id);
      else await this.controller.restoreSubject(id);
      await this._refreshSubjects();
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

  beforeDestroy() {
    this.fab?.remove?.();
    this.formModal?.close();
    this.banner?.close();
    if (this.content) this.content.remove();
    if (this.toggleGroup) this.toggleGroup.remove();
  }

  destroy() {
    this.beforeDestroy();
    this.container.innerHTML = "";
  }

  getToggleButtonClass(viewType) {
    return `px-4 py-2 transition duration-150 ${
      this.currentView === viewType
        ? "bg-primary text-white"
        : "bg-white hover:bg-base-200"
    }`;
  }
}
