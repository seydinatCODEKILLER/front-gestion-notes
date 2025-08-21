import { Modal } from "@/components/modal/Modal";
import { ModernTable } from "@/components/table/Table.js";

export class TeacherDetailsModal {
  constructor(app, teacher) {
    this.app = app;
    this.teacher = teacher;
    this.controller = app.getController("teacherSubjects");
    this.teacherSubjects = [];
    this.isInitialized = false;
    this.initPromise = this.init(); // Stocker la promesse d'initialisation
  }

  async init() {
    await this.loadTeacherSubjects();
    this.createModal();
    this.isInitialized = true;
  }

  async loadTeacherSubjects() {
    try {
      this.teacherSubjects = await this.controller.getTeacherSubjects(
        this.teacher.id
      );
    } catch (error) {
      console.error(
        "Erreur lors du chargement des matières du professeur:",
        error
      );
      this.teacherSubjects = [];
    }
  }

  createModal() {
    const content = this.getModalContent();

    this.modal = new Modal({
      title: `Détails du professeur: ${this.teacher.user.prenom} ${this.teacher.user.nom}`,
      content: content,
      size: "2xl",
      footerButtons: [
        {
          text: "Fermer",
          className: "btn-ghost",
          action: "cancel",
          onClick: () => this.close(),
        },
      ],
    });
  }

  getModalContent() {
    const container = document.createElement("div");
    container.className = "space-y-6";

    // Informations du professeur
    const teacherInfo = this.createTeacherInfo();
    container.appendChild(teacherInfo);

    // Tableau des matières affectées
    const subjectsTable = this.createSubjectsTable();
    container.appendChild(subjectsTable);

    return container;
  }

  createTeacherInfo() {
    const infoContainer = document.createElement("div");
    infoContainer.className =
      "grid grid-cols-2 gap-4 p-4 bg-base-100 rounded-lg";

    const info = [
      { label: "Nom", value: this.teacher.user.nom },
      { label: "Prénom", value: this.teacher.user.prenom },
      { label: "Email", value: this.teacher.user.email },
      { label: "Téléphone", value: this.teacher.user.telephone },
      { label: "Spécialité", value: this.teacher.specialite },
      { label: "Statut", value: this.teacher.user.statut },
    ];

    info.forEach((item) => {
      const div = document.createElement("div");
      div.className = "flex flex-col";
      div.innerHTML = `
        <span class="text-sm font-semibold text-gray-600">${item.label}</span>
        <span class="text-base">${item.value}</span>
      `;
      infoContainer.appendChild(div);
    });

    return infoContainer;
  }

  createSubjectsTable() {
    const container = document.createElement("div");
    container.className = "space-y-4";

    const title = document.createElement("h3");
    title.className = "text-lg font-semibold";
    title.textContent = "Matières affectées";
    container.appendChild(title);

    if (this.teacherSubjects.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "text-center p-8 text-gray-500";
      emptyMessage.innerHTML = `
        <i class="ri-book-line text-4xl mb-2"></i>
        <p>Aucune matière affectée à ce professeur</p>
      `;
      container.appendChild(emptyMessage);
      return container;
    }

    const table = new ModernTable({
      itemsPerPage: 5,
      columns: [
        {
          header: "Matière",
          key: "subject.nom",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.subject?.nom || "N/A";
            return span;
          },
        },
        {
          header: "Niveau",
          key: "subject.niveauId",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.subject?.niveauId || "N/A";
            return span;
          },
        },
        {
          header: "Coefficient",
          key: "subject.coefficient",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.subject?.coefficient || "N/A";
            return span;
          },
        },
      ],
      data: this.teacherSubjects,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "delete",
            icon: "ri-delete-bin-line",
            className: "btn-error btn-sm",
            action: (item) => "delete",
          },
        ],
      },
      onAction: (action, id, actionType) =>
        this.handleSubjectAction(action, id, actionType),
    });

    container.appendChild(table.render());
     setTimeout(() => {
       table.update(this.teacherSubjects, 1);
     }, 0);
    return container;
  }

  async handleSubjectAction(action, assignmentId, actionType) {
    if (action === "delete") {
      const confirmed = await this.showConfirmation(
        "Supprimer cette affectation ?"
      );

      if (!confirmed) return;

      try {
        await this.controller.removeAssignment(assignmentId);
        // Recharger les matières du professeur
        await this.loadTeacherSubjects();
        // Mettre à jour le modal
        this.updateModalContent();
      } catch (error) {
        this.handleActionError(error);
      }
    }
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

  updateModalContent() {
    const newContent = this.getModalContent();
    this.modal.updateContent(newContent);
  }

  handleActionError(error) {
    console.error("Erreur lors de la gestion de l'action:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue",
      "error"
    );
  }

  async open() {
    if (!this.isInitialized) {
      await this.initPromise;
    }
    this.modal.open();
  }

  close() {
    this.modal.close();
  }
}
