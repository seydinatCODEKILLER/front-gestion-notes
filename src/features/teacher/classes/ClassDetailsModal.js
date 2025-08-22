import { Modal } from "@/components/modal/Modal";
import { ModernTable } from "@/components/table/Table.js";

export class ClassDetailsModal {
  constructor(app, classe) {
    this.app = app;
    this.classe = classe;
    this.controller = app.getController("classes");
    this.students = [];
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  async init() {
    await this.loadClassStudents();
    this.createModal();
    this.isInitialized = true;
  }

  async loadClassStudents() {
    try {
      const classDetails = await this.controller.getClassWithStudents(
        this.classe.id
      );
      this.students = classDetails.students || [];
    } catch (error) {
      console.error("Erreur lors du chargement des élèves:", error);
      this.students = [];
    }
  }

  createModal() {
    const content = this.getModalContent();

    this.modal = new Modal({
      title: `Détails de la classe: ${this.classe.nom}`,
      content: content,
      size: "xl",
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

    // Tableau des élèves
    const studentsTable = this.createStudentsTable();
    container.appendChild(studentsTable);

    return container;
  }

  createClassInfo() {
    const infoContainer = document.createElement("div");
    infoContainer.className =
      "grid grid-cols-2 gap-4 p-4 bg-base-100 rounded-lg";

    const info = [
      { label: "Classe", value: this.classe.nom },
      { label: "Niveau", value: this.classe.niveau?.libelle || "N/A" },
      { label: "Effectif", value: `${this.students.length} élève(s)` },
      { label: "Capacité", value: this.classe.capacite_max || "∞" },
      {
        label: "Année scolaire",
        value: this.classe.anneeScolaire?.libelle || "N/A",
      },
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

  createStudentsTable() {
    const container = document.createElement("div");
    container.className = "space-y-4";

    const title = document.createElement("h3");
    title.className = "text-lg font-semibold";
    title.textContent = `Élèves (${this.students.length})`;
    container.appendChild(title);

    if (this.students.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "text-center p-8 text-gray-500";
      emptyMessage.innerHTML = `
        <i class="ri-user-line text-4xl mb-2"></i>
        <p>Aucun élève dans cette classe</p>
      `;
      container.appendChild(emptyMessage);
      return container;
    }

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
          header: "Téléphone",
          key: "user.telephone",
          render: (item) => {
            const span = document.createElement("span");
            span.textContent = item.user?.telephone || "N/A";
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
      data: this.students,
    });

    container.appendChild(table.render());
    setTimeout(() => { table.update(this.students)}, 0);
    return container;
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
