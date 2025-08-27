import { TeacherCard } from "@/components/card/TeacherCard.js";
import { TeacherFormModal } from "./TeacherFormModal.js";
import { ModernTable } from "@/components/table/Table.js";
import { TeacherEditModal } from "./TeacherEditModal.js";
import { FloatingActionButton } from "@/components/button/FloatingButton.js";
import { Modal } from "@/components/modal/Modal.js";
import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";

export class AdminTeacherView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("teachers");
    this.currentView = "cards";
    this.localTeachers = [];

    this.formModal = new TeacherFormModal(app, this.localTeachers, {
      onSave: async () => await this._refreshTeachers(),
    });
  }

  async render() {
    this.container = document.createElement("div");
    this.container.className = "admin-teacher-view p-4 space-y-6";

    await this._setup();
    return this.container;
  }

  async _setup() {
    try {
      this.localTeachers = await this.controller.loadTeachers();
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      console.error("Erreur de chargement des professeurs:", error);
      this.handleActionError(error);
    }
  }

  async _refreshTeachers() {
    this.localTeachers = await this.controller.loadTeachers(true);
    this.renderContent();
  }

  createBanner() {
    const activeTeachers = this.localTeachers.filter(
      (t) => t.user?.statut === "actif"
    );

    const bannerConfig = {
      title: "Gestion des professeurs",
      subtitle: "Ajoutez, modifiez et activez/désactivez vos professeurs",
      primaryText: `${this.localTeachers.length} professeur(s) enregistré(s)`,
      secondaryText:
        activeTeachers.length > 0
          ? `${activeTeachers.length} professeur(s) actif(s)`
          : "Aucun professeur actif",
      icon: '<i class="ri-user-line text-2xl text-blue-600"></i>',
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

    if (this.currentView === "cards") {
      this.renderCardsView(this.content);
    } else {
      this.renderTableView(this.content);
    }
  }

  renderCardsView(container) {
    const cards = new TeacherCard({
      itemsPerPage: 8,
      data: this.localTeachers,
      actions: {
        items: [
          {
            name: "edit",
            label: "Modifier",
            icon: "ri-edit-line",
            visible: (item) => item.user?.statut === "actif",
          },
          {
            name: "toggleStatus",
            label: (item) =>
              item.user?.statut === "actif" ? "Désactiver" : "Activer",
            icon: (item) =>
              item.user?.statut === "actif" ? "ri-close-line" : "ri-check-line",
            className: (item) =>
              item.user?.statut === "actif" ? "btn-error" : "btn-success",
            action: (item) =>
              item.user?.statut === "actif" ? "disable" : "enable",
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleTeacherAction(action, id, actionType),
    });

    container.appendChild(cards.render());
  }

  renderTableView(container) {
    const isActive = (t) => t.user?.statut === "actif";

    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        { header: "Nom", render: (item) => item.user?.nom || "N/A" },
        { header: "Prénom", render: (item) => item.user?.prenom || "N/A" },
        { header: "Email", render: (item) => item.user?.email || "N/A" },
        { header: "Spécialité", render: (item) => item.specialite || "Non spécifié" },
        {
          header: "Statut",
          render: (item) => {
            const badge = document.createElement("span");
            badge.className = "badge " + (isActive(item) ? "badge-success" : "badge-warning");
            badge.textContent = isActive(item) ? "Actif" : "Inactif";
            return badge;
          },
        },
      ],
      data: this.localTeachers,
      actions: {
        displayMode: "direct",
        items: [
          { name: "edit", icon: "ri-edit-line", className: "btn-primary", visible: isActive },
          {
            name: "toggleStatus",
            icon: (t) => (isActive(t) ? "ri-close-line" : "ri-check-line"),
            className: (t) => (isActive(t) ? "btn-error" : "btn-success"),
            action: (t) => (isActive(t) ? "disable" : "enable"),
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleTeacherAction(action, id, actionType),
    });

    container.appendChild(table.render());
    table.update(this.localTeachers, 1);
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

  async handleTeacherAction(action, id, actionType) {
    const teacher = this.localTeachers.find((t) => t.id == id);
    if (!teacher) return;

    try {
      if (action === "edit") await this.handleEditAction(teacher);
      else if (action === "toggleStatus") await this.handleStatusToggle(id, actionType);
      else console.warn(`Action non gérée: ${action}`);
    } catch (error) {
      this.handleActionError(error);
    }
  }

  async handleEditAction(teacher) {
    const modal = new TeacherEditModal(this.app, teacher, {
      onSave: async () => await this._refreshTeachers(),
    });
    await modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDisable = actionType === "disable";
    const confirmed = await this.showConfirmation(
      isDisable ? "Désactiver ce professeur ?" : "Activer ce professeur ?"
    );
    if (!confirmed) return;

    try {
      if (isDisable) await this.controller.deleteTeacher(id);
      else await this.controller.restoreTeacher(id);

      await this._refreshTeachers();
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
