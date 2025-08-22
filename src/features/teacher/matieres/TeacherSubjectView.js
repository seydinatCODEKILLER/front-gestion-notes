import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { SubjectCard } from "@/components/card/SubjectCard.js";
import { ModernTable } from "@/components/table/Table.js";

export class TeacherSubjectView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("subjects");
    this.teacherSubjects = [];
    this.currentView = "cards"; // Par défaut en mode cartes
    this.currentTeacher = this.app.getService("auth").getCurrentUser();
    this.setup();
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      
      if (!this.currentTeacher) {
        this.showError("Utilisateur non connecté");
        return;
      }

      this.teacherSubjects = await this.controller.loadTeacherSubjects(this.currentTeacher.id);
      console.log(this.teacherSubjects);
      this.createBanner();
      this.renderViewToggle();
      this.renderContent();
    } catch (error) {
        console.log(error)
    //   this.showError("Erreur de chargement de vos matières");
    }
  }

  createBanner() {
    const activeSubjects = this.teacherSubjects.filter(s => s.statut === "actif");

    const bannerConfig = {
      title: "Mes Matières",
      subtitle: "Matières assignées pour l'année en cours",
      primaryText: `${this.teacherSubjects.length} matière(s) assignée(s)`,
      secondaryText: `${activeSubjects.length} matière(s) active(s)`,
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
      data: this.teacherSubjects,
      itemsPerPage: 8,
      emptyMessage: "Aucune matière assignée",
      // Pas d'actions pour les professeurs
      actions: null
    });

    container.appendChild(cards.render());
  }

  renderTableView(container) {
    const table = new ModernTable({
      itemsPerPage: 10,
      columns: [
        {
          header: "Matière",
          key: "subject.nom",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.className = "font-semibold";
            span.textContent = item.subject.nom || "N/A";
            return span;
          },
        },
        {
          header: "Niveau",
          key: "subject.niveauId",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.subject.niveauId || "N/A";
            return span;
          },
        },
        {
          header: "Coefficient",
          key: "subject.coefficient",
          sortable: true,
          render: (item) => {
            const span = document.createElement("span");
            span.className = "badge badge-info";
            span.textContent = item.subject.coefficient || "N/A";
            return span;
          },
        },
        {
          header: "Statut",
          key: "subject.statut",
          render: (item) => {
            const badge = document.createElement("span");
            badge.className =
              "badge " +
              (item.subject.statut === "actif" ? "badge-success" : "badge-warning");
            badge.textContent = item.subject.statut === "actif" ? "Actif" : "Inactif";
            return badge;
          },
        },
        {
          header: "Description",
          key: "subject.description",
          render: (item) => {
            const span = document.createElement("span");
            span.className = "text-sm text-gray-600";
            span.textContent = item.subject.description || "Aucune description";
            return span;
          },
        },
      ],
      data: this.teacherSubjects.subject
    });

    container.appendChild(table.render());
    setTimeout(() => {
        table.update(this.teacherSubjects)
    })
  }

  getToggleButtonClass(viewType) {
    return `px-4 py-2 transition duration-150 ${
      this.currentView === viewType
        ? "bg-primary text-white"
        : "bg-white hover:bg-base-200"
    }`;
  }

  cleanup() {
    // Cleanup si nécessaire
  }
}