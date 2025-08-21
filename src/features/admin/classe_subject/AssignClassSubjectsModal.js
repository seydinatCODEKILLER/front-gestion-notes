import { Modal } from "@/components/modal/Modal";

export class AssignClassSubjectsModal {
  constructor(app, classe, anneeScolaire, options = {}) {
    this.app = app;
    this.classe = classe;
    this.anneeScolaire = anneeScolaire;
    this.controller = app.getController("classSubjects");
    this.options = options;
    this.allSubjects = [];
    this.allTeachers = [];
    this.classSubjects = [];
    this.selectedSubjects = new Map(); // Map: subjectId -> teacherId
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
      [this.allSubjects, this.allTeachers, this.classSubjects] =
        await Promise.all([
          this.controller.getAllSubjects(),
          this.controller.getAllTeachersWithSubjects(),
          this.controller.loadClassSubjects(
            this.classe.id,
            this.anneeScolaire.id
          ),
        ]);

      // Pré-remplir avec les affectations existantes
      this.classSubjects.forEach((cs) => {
        this.selectedSubjects.set(cs.subjectId, cs.teacherId || null);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      this.allSubjects = [];
      this.allTeachers = [];
      this.classSubjects = [];
    }
  }

  createModal() {
    const content = this.getModalContent();

    this.modal = new Modal({
      title: `Affecter des matières à ${this.classe.nom} - ${this.anneeScolaire.libelle}`,
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

    // Liste des matières avec sélection de professeur
    const subjectsList = this.createSubjectsList();
    container.appendChild(subjectsList);

    return container;
  }

  createSearchBar() {
    const container = document.createElement("div");
    container.className = "flex gap-3 items-center";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Rechercher une matière...";
    searchInput.className = "input input-bordered flex-1";
    searchInput.addEventListener("input", (e) =>
      this.filterSubjects(e.target.value)
    );

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
    const totalAssigned = Array.from(this.selectedSubjects.values()).filter(
      (teacherId) => teacherId
    ).length;
    this.counterElement.textContent = `${totalSelected} matière(s) sélectionnée(s) • ${totalAssigned} professeur(s) assigné(s)`;
  }

  createSubjectsList() {
    this.listContainer = document.createElement("div");
    this.listContainer.className = "max-h-96 overflow-y-auto space-y-3";
    this.renderSubjectsList();
    return this.listContainer;
  }

  renderSubjectsList() {
    this.listContainer.innerHTML = "";

    if (this.allSubjects.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "text-center p-8 text-gray-500";
      emptyMessage.innerHTML = `
        <i class="ri-book-line text-4xl mb-2"></i>
        <p>Aucune matière disponible</p>
      `;
      this.listContainer.appendChild(emptyMessage);
      return;
    }

    this.allSubjects.forEach((subject) => {
      const subjectItem = this.createSubjectItem(subject);
      this.listContainer.appendChild(subjectItem);
    });
  }

  createSubjectItem(subject) {
    const container = document.createElement("div");
    container.className = "border rounded-lg p-4";

    const header = document.createElement("div");
    header.className = "flex items-center justify-between mb-3";

    const subjectInfo = document.createElement("div");
    subjectInfo.innerHTML = `
      <div class="font-semibold">${subject.nom}</div>
      <div class="text-sm text-gray-500">
        ${subject.niveau?.nom || "N/A"} • Coeff: ${subject.coefficient}
      </div>
    `;

    const checkboxContainer = document.createElement("label");
    checkboxContainer.className = "flex items-center cursor-pointer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox checkbox-primary mr-2";
    checkbox.checked = this.selectedSubjects.has(subject.id);
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        this.selectedSubjects.set(subject.id, null);
      } else {
        this.selectedSubjects.delete(subject.id);
      }
      this.updateSelectionCounter();
      this.toggleTeacherSelect(subject.id, e.target.checked);
    });

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(document.createTextNode("Affecter"));

    header.appendChild(subjectInfo);
    header.appendChild(checkboxContainer);
    container.appendChild(header);

    // Sélecteur de professeur
    const teacherSelectContainer = document.createElement("div");
    teacherSelectContainer.className = `mt-2 ${
      this.selectedSubjects.has(subject.id) ? "" : "hidden"
    }`;
    teacherSelectContainer.id = `teacher-select-${subject.id}`;

    const select = document.createElement("select");
    select.className = "select select-bordered select-sm w-full";
    select.addEventListener("change", (e) => {
      this.selectedSubjects.set(
        subject.id,
        e.target.value ? parseInt(e.target.value) : null
      );
      this.updateSelectionCounter();
    });

    // Option par défaut
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Sélectionner un professeur...";
    select.appendChild(defaultOption);

    console.log(this.allTeachers)

    // Filtrer les professeurs qualifiés pour cette matière
    const qualifiedTeachers = this.allTeachers.filter((teacher) =>
      teacher.teacherSubjects?.some((ts) => ts.subjectId === subject.id)
    );

    qualifiedTeachers.forEach((teacher) => {
      const option = document.createElement("option");
      option.value = teacher.id;
      option.textContent = `${teacher.user.prenom} ${teacher.user.nom}`;
      option.selected = this.selectedSubjects.get(subject.id) === teacher.id;
      select.appendChild(option);
    });

    if (qualifiedTeachers.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Aucun professeur qualifié";
      option.disabled = true;
      select.appendChild(option);
    }

    teacherSelectContainer.appendChild(select);
    container.appendChild(teacherSelectContainer);

    return container;
  }

  toggleTeacherSelect(subjectId, show) {
    const selectContainer = document.getElementById(
      `teacher-select-${subjectId}`
    );
    if (selectContainer) {
      selectContainer.classList.toggle("hidden", !show);
    }
  }

  filterSubjects(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    this.allSubjects.forEach((subject) => {
      const subjectElement = this.listContainer.querySelector(
        `#teacher-select-${subject.id}`
      )?.parentElement;
      if (subjectElement) {
        const matches =
          subject.nom.toLowerCase().includes(term) ||
          (subject.niveau?.nom || "").toLowerCase().includes(term);
        subjectElement.classList.toggle("hidden", !matches);
      }
    });
  }

  async handleSubmit() {
    try {
      // Préparer les données pour l'envoi
      const assignments = Array.from(this.selectedSubjects.entries()).map(
        ([subjectId, teacherId]) => ({
          classId: this.classe.id,
          subjectId: subjectId,
          teacherId: teacherId,
          anneeScolaireId: this.anneeScolaire.id,
        })
      );

      if (assignments.length === 0) {
        this.app.services.notifications.show(
          "Aucune matière sélectionnée",
          "info"
        );
        return;
      }

      // Envoyer les affectations
      for (const assignment of assignments) {
        // Vérifier si l'affectation existe déjà
        const existing = this.classSubjects.find(
          (cs) => cs.subjectId === assignment.subjectId
        );

        if (existing) {
          // Mettre à jour l'affectation existante
          await this.controller.updateAssignment(existing.id, {
            teacherId: assignment.teacherId,
          });
        } else {
          // Créer une nouvelle affectation
          await this.controller.assignSubject(assignment);
        }
      }

      this.app.services.notifications.show(
        "Affectations mises à jour avec succès",
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
