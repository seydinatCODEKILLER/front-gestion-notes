import { Modal } from "@/components/modal/Modal";

export class GenerateReportCardModal {
  constructor(app, options = {}) {
    this.app = app;
    this.controller = app.getController("reportCards");
    this.options = options;
    this.students = [];
    this.trimestres = [];
    this.selectedStudent = null;
    this.selectedTrimestre = null;
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  async init() {
    await this.loadTrimestres();
    this.createModal();
    this.isInitialized = true;
  }

  async loadTrimestres() {
    try {
      this.trimestres = await this.controller.getTrimestres();
    } catch (error) {
      console.error("Erreur lors du chargement des trimestres:", error);
      this.trimestres = [];
    }
  }

  async searchStudents(searchTerm) {
    try {
      this.students = await this.controller.searchStudents(searchTerm);
      this.renderSearchResults();
    } catch (error) {
      console.error("Erreur lors de la recherche des étudiants:", error);
      this.students = [];
      this.renderSearchResults();
    }
  }

  createModal() {
    const content = this.getModalContent();

    this.modal = new Modal({
      title: "Générer un Bulletin",
      content: content,
      size: "lg",
      footerButtons: [
        {
          text: "Annuler",
          className: "btn-ghost",
          action: "cancel",
          onClick: () => this.close(),
        },
        {
          text: "Générer le Bulletin",
          className: "btn-primary",
          action: "submit",
          onClick: () => this.handleGenerate(),
          closeOnClick: false,
          disabled: true,
          // Ajouter un attribut data-action pour le retrouver plus tard
          attributes: { "data-action": "submit" },
        },
      ],
    });

    // Après que le modal a été rendu dans le DOM
    this.submitButton = document.querySelector('.modal [data-action="submit"]');

    this.updateSubmitButton();
  }

  getModalContent() {
    const container = document.createElement("div");
    container.className = "space-y-6";

    // Recherche d'étudiant
    const searchSection = this.createSearchSection();
    container.appendChild(searchSection);

    // Résultats de recherche
    this.resultsContainer = document.createElement("div");
    this.resultsContainer.className = "max-h-64 overflow-y-auto hidden";
    container.appendChild(this.resultsContainer);

    // Sélection du trimestre
    const trimestreSection = this.createTrimestreSection();
    container.appendChild(trimestreSection);

    return container;
  }

  createSearchSection() {
    const container = document.createElement("div");
    container.className = "space-y-3";

    const label = document.createElement("label");
    label.className = "label";
    label.innerHTML = '<span class="label-text">Rechercher un étudiant</span>';

    const searchContainer = document.createElement("div");
    searchContainer.className = "relative";

    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Nom, prénom ou email de l'étudiant...";
    this.searchInput.className = "input input-bordered w-full";
    this.searchInput.addEventListener(
      "input",
      debounce((e) => {
        this.searchStudents(e.target.value);
      }, 300)
    );

    searchContainer.appendChild(this.searchInput);
    container.appendChild(label);
    container.appendChild(searchContainer);

    return container;
  }

  createTrimestreSection() {
    const container = document.createElement("div");
    container.className = "space-y-3";

    const label = document.createElement("label");
    label.className = "label";
    label.innerHTML =
      '<span class="label-text">Sélectionner le trimestre</span>';

    this.trimestreSelect = document.createElement("select");
    this.trimestreSelect.className = "select select-bordered w-full";
    this.trimestreSelect.innerHTML =
      '<option value="">Sélectionner un trimestre</option>';

    this.trimestres.forEach((trimestre) => {
      const option = document.createElement("option");
      option.value = trimestre.id;
      option.textContent = `${trimestre.libelle} - ${
        trimestre.annee_scolaire?.libelle || ""
      }`;
      this.trimestreSelect.appendChild(option);
    });

    this.trimestreSelect.addEventListener("change", (e) => {
      this.selectedTrimestre = this.trimestres.find(
        (t) => t.id === parseInt(e.target.value)
      );
      this.updateSubmitButton();
    });

    container.appendChild(label);
    container.appendChild(this.trimestreSelect);

    return container;
  }

  renderSearchResults() {
    this.resultsContainer.innerHTML = "";
    this.resultsContainer.classList.toggle(
      "hidden",
      this.students.length === 0
    );

    if (this.students.length === 0) {
      if (this.searchInput.value) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "text-center p-4 text-gray-500";
        emptyMessage.textContent = "Aucun étudiant trouvé";
        this.resultsContainer.appendChild(emptyMessage);
      }
      return;
    }

    const list = document.createElement("div");
    list.className = "space-y-2";

    this.students.forEach((student) => {
      const item = this.createStudentItem(student);
      list.appendChild(item);
    });

    this.resultsContainer.appendChild(list);
  }

  createStudentItem(student) {
    const item = document.createElement("div");
    item.className =
      "p-3 border rounded-lg cursor-pointer hover:bg-base-100 transition-colors";

    item.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <div class="font-semibold">${student.user.prenom} ${
      student.user.nom
    }</div>
          <div class="text-sm text-gray-500">${student.user.email}</div>
          <div class="text-sm text-gray-500">${
            student.class?.nom || "Classe non assignée"
          }</div>
        </div>
        <button class="btn btn-primary btn-sm" data-action="select">
          Sélectionner
        </button>
      </div>
    `;

    item
      .querySelector('[data-action="select"]')
      .addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectStudent(student);
      });

    return item;
  }

  selectStudent(student) {
    this.selectedStudent = student;
    this.searchInput.value = `${student.user.prenom} ${student.user.nom}`;
    this.resultsContainer.classList.add("hidden");
    this.updateSubmitButton();
  }

  updateSubmitButton() {
    const canSubmit = this.selectedStudent && this.selectedTrimestre;
    if (this.submitButton) {
      this.submitButton.disabled = !canSubmit;
    }
  }

  async handleGenerate() {
    if (!this.selectedStudent || !this.selectedTrimestre) return;

    try {
      await this.controller.generateReportCard({
        studentId: this.selectedStudent.id,
        trimestreId: this.selectedTrimestre.id,
      });

      if (this.options.onSave) {
        await this.options.onSave();
      }

      this.close();
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.error("Erreur lors de la génération du bulletin:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue lors de la génération",
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

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
