import { Modal } from "@/components/modal/Modal";

export class AssignSubjectsModal {
  constructor(app, teacher, options = {}) {
    this.app = app;
    this.teacher = teacher;
    this.controller = app.getController("teacherSubjects");
    this.options = options;
    this.allSubjects = [];
    this.filteredSubjects = [];
    this.teacherSubjects = [];
    this.selectedSubjects = new Set();
    this.isInitialized = false;
    this.initPromise = this.init();
  }

  async init() {
    await this.loadData();
    this.createModal();
    this.isInitialized = true;
  }

  async loadData() {
    try {
      [this.allSubjects, this.teacherSubjects] = await Promise.all([
        this.controller.getAllSubjects(),
        this.controller.getTeacherSubjects(this.teacher.id)
      ]);
      
      this.filteredSubjects = [...this.allSubjects];
      
      // Pré-selectionner les matières déjà affectées
      this.teacherSubjects.forEach(subject => {
        this.selectedSubjects.add(subject.subjectId);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      this.allSubjects = [];
      this.filteredSubjects = [];
      this.teacherSubjects = [];
    }
  }

  createModal() {
    const content = this.getModalContent();
    
    this.modal = new Modal({
      title: `Affecter des matières à ${this.teacher.user.prenom} ${this.teacher.user.nom}`,
      content: content,
      size: "2xl",
      footerButtons: [
        {
          text: "Annuler",
          className: "btn-ghost",
          action: "cancel",
          onClick: () => this.close(),
        },
        {
          text: "Valider",
          className: "btn-primary",
          action: "submit",
          onClick: () => this.handleSubmit(),
          closeOnClick: false,
        },
      ],
    });
  }

  getModalContent() {
    const container = document.createElement("div");
    container.className = "space-y-4";

    // Barre de recherche
    const searchContainer = this.createSearchBar();
    container.appendChild(searchContainer);

    // Compteur de sélection
    const counter = this.createSelectionCounter();
    container.appendChild(counter);

    // Filtres rapides
    const quickFilters = this.createQuickFilters();
    container.appendChild(quickFilters);

    // Liste des matières
    const subjectsList = this.createSubjectsList();
    container.appendChild(subjectsList);

    return container;
  }

  createSearchBar() {
    const container = document.createElement("div");
    container.className = "flex gap-3 items-center";

    // Barre de recherche
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Rechercher une matière...";
    searchInput.className = "input input-bordered flex-1";
    searchInput.addEventListener("input", (e) => this.filterSubjects(e.target.value));

    // Bouton de réinitialisation
    const resetButton = document.createElement("button");
    resetButton.className = "btn btn-ghost btn-sm";
    resetButton.innerHTML = '<i class="ri-close-line"></i>';
    resetButton.title = "Réinitialiser la recherche";
    resetButton.addEventListener("click", () => {
      searchInput.value = "";
      this.filterSubjects("");
    });

    container.appendChild(searchInput);
    container.appendChild(resetButton);

    return container;
  }

  createSelectionCounter() {
    this.counterElement = document.createElement("div");
    this.counterElement.className = "text-sm text-gray-600 font-medium";
    this.updateSelectionCounter();
    return this.counterElement;
  }

  updateSelectionCounter() {
    const totalSelected = this.selectedSubjects.size;
    const totalAvailable = this.filteredSubjects.length;
    this.counterElement.textContent = 
      `${totalSelected} matière(s) sélectionnée(s) • ${totalAvailable} matière(s) disponible(s)`;
  }

  createQuickFilters() {
    const container = document.createElement("div");
    container.className = "flex flex-wrap gap-2";

    // Filtre par niveau
    const levels = [...new Set(this.allSubjects.map(s => s.niveau?.nom).filter(Boolean))];
    
    levels.forEach(level => {
      const button = document.createElement("button");
      button.className = "btn btn-xs btn-outline";
      button.textContent = level;
      button.addEventListener("click", () => this.filterByLevel(level));
      container.appendChild(button);
    });

    // Bouton tous les niveaux
    const allButton = document.createElement("button");
    allButton.className = "btn btn-xs btn-primary";
    allButton.textContent = "Tous les niveaux";
    allButton.addEventListener("click", () => this.filterSubjects(""));
    container.appendChild(allButton);

    return container;
  }

  createSubjectsList() {
    this.listContainer = document.createElement("div");
    this.listContainer.className = "max-h-96 overflow-y-auto space-y-2";
    this.renderSubjectsList();
    return this.listContainer;
  }

  renderSubjectsList() {
    this.listContainer.innerHTML = '';

    if (this.filteredSubjects.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "text-center p-8 text-gray-500";
      emptyMessage.innerHTML = `
        <i class="ri-search-line text-4xl mb-2"></i>
        <p>Aucune matière trouvée</p>
      `;
      this.listContainer.appendChild(emptyMessage);
      return;
    }

    // Grouper les matières par niveau
    const groupedSubjects = this.groupSubjectsByLevel(this.filteredSubjects);

    Object.entries(groupedSubjects).forEach(([levelName, subjects]) => {
      const levelSection = this.createLevelSection(levelName, subjects);
      this.listContainer.appendChild(levelSection);
    });
  }

  createLevelSection(levelName, subjects) {
    const section = document.createElement("div");
    section.className = "border border-gray-200 rounded-lg p-4";

    const header = document.createElement("div");
    header.className = "flex items-center justify-between mb-3";
    
    const title = document.createElement("h3");
    title.className = "font-semibold text-lg";
    title.textContent = levelName;
    
    const count = document.createElement("span");
    count.className = "badge badge-neutral";
    count.textContent = `${subjects.length} matière(s)`;
    
    header.appendChild(title);
    header.appendChild(count);
    section.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-2";

    subjects.forEach(subject => {
      const subjectItem = this.createSubjectItem(subject);
      grid.appendChild(subjectItem);
    });

    section.appendChild(grid);
    return section;
  }

  createSubjectItem(subject) {
    const container = document.createElement("label");
    container.className = "flex items-center p-3 border border-gray-100 rounded-lg cursor-pointer hover:bg-base-100 transition-colors";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox checkbox-primary mr-3";
    checkbox.checked = this.selectedSubjects.has(subject.id);
    checkbox.value = subject.id;
    
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        this.selectedSubjects.add(subject.id);
      } else {
        this.selectedSubjects.delete(subject.id);
      }
      this.updateSelectionCounter();
    });

    const subjectInfo = document.createElement("div");
    subjectInfo.className = "flex-grow";
    subjectInfo.innerHTML = `
      <div class="font-medium">${subject.nom}</div>
      <div class="text-xs text-gray-500 flex justify-between">
        <span>Coeff: ${subject.coefficient}</span>
        <span class="badge badge-xs">${subject.niveauId || 'N/A'}</span>
      </div>
    `;

    container.appendChild(checkbox);
    container.appendChild(subjectInfo);
    return container;
  }

  filterSubjects(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredSubjects = [...this.allSubjects];
    } else {
      this.filteredSubjects = this.allSubjects.filter(subject =>
        subject.nom.toLowerCase().includes(term) ||
        (subject.niveau?.nom || '').toLowerCase().includes(term)
      );
    }
    
    this.renderSubjectsList();
    this.updateSelectionCounter();
  }

  filterByLevel(levelName) {
    this.filteredSubjects = this.allSubjects.filter(subject =>
      subject.niveau?.nom === levelName
    );
    
    this.renderSubjectsList();
    this.updateSelectionCounter();
  }

  groupSubjectsByLevel(subjects) {
    const grouped = {};
    
    subjects.forEach(subject => {
      const levelName = subject.niveau?.nom || "Non classé";
      if (!grouped[levelName]) {
        grouped[levelName] = [];
      }
      grouped[levelName].push(subject);
    });

    // Trier par nom de niveau
    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
    );
  }

  async handleSubmit() {
    try {
      const selectedIds = Array.from(this.selectedSubjects);
      
      // Filtrer les nouvelles affectations (celles qui ne sont pas déjà affectées)
      const existingSubjectIds = this.teacherSubjects.map(sub => sub.subjectId);
      const newSubjectIds = selectedIds.filter(id => !existingSubjectIds.includes(id));

      if (newSubjectIds.length === 0) {
        this.app.services.notifications.show(
          "Aucune nouvelle matière à affecter",
          "info"
        );
        this.close();
        return;
      }

      // Affecter les nouvelles matières
      const assignments = newSubjectIds.map(subjectId =>
        this.controller.assignSubject({
          teacherId: this.teacher.id,
          subjectId: subjectId
        })
      );

      await Promise.all(assignments);

      this.app.services.notifications.show(
        `${newSubjectIds.length} matière(s) affectée(s) avec succès`,
        "success"
      );

      if (this.options?.onSave) {
        await this.options.onSave();
      }

      this.close();
    } catch (error) {
      this.handleSubmitError(error);
    }
  }

  handleSubmitError(error) {
    console.error("Erreur lors de l'affectation:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue lors de l'affectation",
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