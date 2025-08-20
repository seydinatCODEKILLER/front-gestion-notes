import { StudentCard } from "@/components/card/StudentCard.js";
import { StudentFormModal } from "./StudentFormModal.js";
import { ModernTable } from "@/components/table/Table.js";
import { StudentEditModal } from "./StudentEditModal.js";
import { FloatingActionButton } from "@/components/button/FloatingButton.js";
import { Modal } from "@/components/modal/Modal.js";
import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";

export class AdminStudentView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("students");
    this.currentView = "cards";
    this.localStudents = [];

    this.formModal = new StudentFormModal(app, this.localStudents, {
      onSave: async () => {
        this.localStudents = await this.controller.loadStudents(true);
        this.renderContent();
      },
    });
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      this.localStudents = await this.controller.loadStudents();
      console.log(this.localStudents);
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      this.showError("Erreur de chargement des élèves");
    }
  }

  createBanner() {
    const activeStudents = this.localStudents.filter(
      (s) => s.user?.statut === "actif"
    );

    const bannerConfig = {
      title: "Gestion des élèves",
      subtitle: "Ajoutez, modifiez et activez/désactivez vos élèves",
      primaryText: `${this.localStudents.length} élève(s) enregistré(s)`,
      secondaryText: `${activeStudents.length} élève(s) actif(s)`,
      icon: '<i class="ri-user-line text-2xl text-green-600"></i>',
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
    const cards = new StudentCard({
      itemsPerPage: 8,
      data: this.localStudents,
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
        this.handleStudentAction(action, id, actionType),
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
          header: "Classe",
          key: "class.nom",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.class?.nom || "Non affecté";
            return span;
          },
        },
        {
          header: "Âge",
          key: "date_naissance",
          render: (item) => {
            const span = document.createElement("span");
            if (item.date_naissance) {
              const birthDate = new Date(item.date_naissance);
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();

              if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
              ) {
                age--;
              }
              span.textContent = `${age} ans`;
            } else {
              span.textContent = "N/A";
            }
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
      data: this.localStudents,
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
        this.handleStudentAction(action, id, actionType),
    });

    container.appendChild(table.render());
    setTimeout(() => {
      table.update(this.localStudents, 1);
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

  async handleStudentAction(action, id, actionType) {
    const student = this.findStudentById(id);
    if (!student) return;
    try {
      switch (action) {
        case "edit":
          await this.handleEditAction(student);
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

  findStudentById(id) {
    return this.localStudents.find((s) => s.id == id);
  }

  async handleEditAction(student) {
    const modal = new StudentEditModal(this.app, student, {
      onSave: async () => {
        this.localStudents = await this.controller.loadStudents(true);
        this.renderContent();
      },
    });
    await modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDisableAction = actionType === "disable";
    const confirmed = await this.showConfirmation(
      isDisableAction ? "Désactiver cet élève ?" : "Activer cet élève ?"
    );

    if (!confirmed) return;

    try {
      if (isDisableAction) {
        await this.controller.deleteStudent(id);
      } else {
        await this.controller.restoreStudent(id);
      }

      // Recharger les données
      this.localStudents = await this.controller.loadStudents(true);
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
