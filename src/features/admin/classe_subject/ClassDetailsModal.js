import { Modal } from "@/components/modal/Modal";
import { ModernTable } from "@/components/table/Table.js";

export class ClassDetailsModal {
  constructor(app, classe, anneeScolaire) {
    this.app = app;
    this.classe = classe;
    this.anneeScolaire = anneeScolaire;
    this.controller = app.getController("classSubjects");
    this.classSubjects = [];
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  async init() {
    await this.loadClassSubjects();
    this.createModal();
    this.isInitialized = true;
  }

  async loadClassSubjects() {
    try {
      this.classSubjects = await this.controller.loadClassSubjects(
        this.classe.id,
        this.anneeScolaire.id
      );
    } catch (error) {
      console.error(
        "Erreur lors du chargement des matières de la classe:",
        error
      );
      this.classSubjects = [];
    }
  }

  createModal() {
    const content = this.getModalContent();

    this.modal = new Modal({
      title: `Détails de la classe: ${this.classe.nom} - ${this.anneeScolaire.libelle}`,
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

    // Informations de la classe
    const classInfo = this.createClassInfo();
    container.appendChild(classInfo);

    // Tableau des matières affectées
    const subjectsTable = this.createSubjectsTable();
    container.appendChild(subjectsTable);

    return container;
  }

  createClassInfo() {
    const infoContainer = document.createElement("div");
    infoContainer.className =
      "grid grid-cols-2 gap-4 p-4 bg-base-100 rounded-lg";

      console.log(this.classe)

    const info = [
      { label: "Classe", value: this.classe.nom },
      { label: "Niveau", value: this.classe.niveau?.libelle || "N/A" },
      { label: "Effectif", value: this.classe._count.students || "0" },
      { label: "Capacité", value: this.classe.capacite_max || "0" },
      { label: "Année scolaire", value: this.anneeScolaire.libelle },
      { label: "Statut", value: this.classe.statut || "N/A" },
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

    if (this.classSubjects.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "text-center p-8 text-gray-500";
      emptyMessage.innerHTML = `
        <i class="ri-book-line text-4xl mb-2"></i>
        <p>Aucune matière affectée à cette classe</p>
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
          header: "Coefficient",
          key: "subject.coefficient",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.subject?.coefficient || "N/A";
            return span;
          },
        },
        {
          header: "Professeur",
          key: "teacher.user",
          render: (item) => {
            const span = document.createElement("span");
            if (item.teacher?.user) {
              span.textContent = `${item.teacher.user.prenom} ${item.teacher.user.nom}`;
            } else {
              span.textContent = "Non assigné";
              span.className = "text-gray-500 italic";
            }
            return span;
          },
        },
      ],
      data: this.classSubjects,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "edit",
            icon: "ri-edit-line",
            className: "btn-primary btn-sm",
            action: (item) => "edit",
          },
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
      table.update(this.classSubjects, 1);
    }, 0);
    return container;
  }

  async handleSubjectAction(action, assignmentId, actionType) {
    const assignment = this.classSubjects.find((a) => a.id === assignmentId);

    if (action === "delete") {
      const confirmed = await this.showConfirmation(
        "Supprimer cette affectation ?"
      );

      if (!confirmed) return;

      try {
        await this.controller.removeAssignment(assignmentId);
        await this.loadClassSubjects();
        this.updateModalContent();
      } catch (error) {
        this.handleActionError(error);
      }
    } else if (action === "edit") {
      await this.handleEditAssignment(assignment);
    }
  }

  async handleEditAssignment(assignment) {
    // Implémenter la logique d'édition ici
    // Pourrait ouvrir un modal pour changer le professeur
    this.app.services.notifications.show(
      "Fonctionnalité d'édition à implémenter",
      "info"
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
