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
      onSave: async () => {
        this.localTeachers = await this.controller.loadTeachers(true);
        this.renderContent();
      },
    });
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      this.localTeachers = await this.controller.loadTeachers();
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      console.log(error)
      // this.showError("Erreur de chargement des professeurs");
    }
  }

  createBanner() {
    const activeTeachers = this.localTeachers.filter(
      (t) => t.user?.statut === "actif"
    );

    const bannerConfig = {
      title: "Gestion des professeurs",
      subtitle: "Ajoutez, modifiez et activez/désactivez vos professeurs",
      primaryText: `${this.localTeachers.length} professeur(s) enregistré(s)`,
      secondaryText: `${activeTeachers.length} professeur(s) actif(s)`,
      icon: '<i class="ri-user-line text-2xl text-blue-600"></i>',
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
    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        {
          header: "Nom",
          key: "user.nom",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.user?.nom || "N/A";
            return span;
          },
        },
        {
          header: "Prénom",
          key: "user.prenom",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.user?.prenom || "N/A";
            return span;
          },
        },
        {
          header: "Email",
          key: "user.email",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.user?.email || "N/A";
            return span;
          },
        },
        {
          header: "Spécialité",
          key: "specialite",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.specialite || "Non spécifié";
            return span;
          },
        },
        {
          header: "Statut",
          key: "user.statut",
          render: (item) => {
            const badge = document.createElement("span");
            badge.className =
              "badge " +
              (item.user?.statut === "actif"
                ? "badge-success"
                : "badge-warning");
            badge.textContent =
              item.user?.statut === "actif" ? "Actif" : "Inactif";
            return badge;
          },
        },
      ],
      data: this.localTeachers,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "edit",
            icon: "ri-edit-line",
            className: "btn-primary",
            visible: (item) => item.user?.statut === "actif",
          },
          {
            name: "toggleStatus",
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

    container.appendChild(table.render());
    setTimeout(() => {
      table.update(this.localTeachers, 1);
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

  async handleTeacherAction(action, id, actionType) {
    const teacher = this.findTeacherById(id);
    if (!teacher) return;
    try {
      switch (action) {
        case "edit":
          await this.handleEditAction(teacher);
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

  findTeacherById(id) {
    return this.localTeachers.find((t) => t.id == id);
  }

  async handleEditAction(teacher) {
    const modal = new TeacherEditModal(this.app, teacher, {
      onSave: async () => {
        this.localTeachers = await this.controller.loadTeachers(true);
        this.renderContent();
      },
    });
    await modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDisableAction = actionType === "disable";
    const confirmed = await this.showConfirmation(
      isDisableAction ? "Désactiver ce professeur ?" : "Activer ce professeur ?"
    );

    if (!confirmed) return;

    try {
      if (isDisableAction) {
        await this.controller.deleteTeacher(id);
      } else {
        await this.controller.restoreTeacher(id);
      }

      // Recharger les données
      this.localTeachers = await this.controller.loadTeachers(true);
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
