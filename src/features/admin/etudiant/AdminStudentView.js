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
      onSave: async () => await this._refreshStudents(),
    });
  }

  async render() {
    this.container = document.createElement("div");
    this.container.className = "admin-student-view p-4 space-y-6";

    await this._setup();
    return this.container;
  }

  async _setup() {
    try {
      this.localStudents = await this.controller.loadStudents();
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
      this.initFloatingButton();
    } catch (error) {
      console.error("Erreur de chargement des élèves:", error);
      this.handleActionError(error);
    }
  }

  async _refreshStudents() {
    this.localStudents = await this.controller.loadStudents(true);
    this.renderContent();
  }

  createBanner() {
    const activeStudents = this.localStudents.filter(
      (s) => s.user?.statut === "actif"
    );

    const bannerConfig = {
      title: "Gestion des élèves",
      subtitle: "Ajoutez, modifiez et activez/désactivez vos élèves",
      primaryText: `${this.localStudents.length} élève(s) enregistré(s)`,
      secondaryText:
        activeStudents.length > 0
          ? `${activeStudents.length} élève(s) actif(s)`
          : "Aucun élève actif",
      icon: '<i class="ri-user-line text-2xl text-green-600"></i>',
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
    const isActive = (s) => s.user?.statut === "actif";

    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        { header: "Nom", render: (item) => item.user?.nom || "N/A" },
        { header: "Prénom", render: (item) => item.user?.prenom || "N/A" },
        { header: "Email", render: (item) => item.user?.email || "N/A" },
        {
          header: "Classe",
          render: (item) => item.class?.nom || "Non affecté",
        },
        {
          header: "Âge",
          render: (item) => {
            if (!item.date_naissance) return document.createTextNode("N/A");
            const birth = new Date(item.date_naissance);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            if (
              today.getMonth() < birth.getMonth() ||
              (today.getMonth() === birth.getMonth() &&
                today.getDate() < birth.getDate())
            )
              age--;
            return document.createTextNode(`${age} ans`);
          },
        },
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
      data: this.localStudents,
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
        this.handleStudentAction(action, id, actionType),
    });

    container.appendChild(table.render());
    table.update(this.localStudents, 1);
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

  async handleStudentAction(action, id, actionType) {
    const student = this.localStudents.find((s) => s.id == id);
    if (!student) return;

    try {
      if (action === "edit") await this.handleEditAction(student);
      else if (action === "toggleStatus")
        await this.handleStatusToggle(id, actionType);
      else console.warn(`Action non gérée: ${action}`);
    } catch (error) {
      this.handleActionError(error);
    }
  }

  async handleEditAction(student) {
    const modal = new StudentEditModal(this.app, student, {
      onSave: async () => await this._refreshStudents(),
    });
    await modal.open();
  }

  async handleStatusToggle(id, actionType) {
    const isDisable = actionType === "disable";
    const confirmed = await this.showConfirmation(
      isDisable ? "Désactiver cet élève ?" : "Activer cet élève ?"
    );
    if (!confirmed) return;

    try {
      if (isDisable) await this.controller.deleteStudent(id);
      else await this.controller.restoreStudent(id);

      await this._refreshStudents();
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
