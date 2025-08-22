import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { Modal } from "@/components/modal/Modal.js";

export class GradeEntryView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("grades");
    this.currentTeacher = this.app.getService("auth").getCurrentUser();
    this.state = {
      selectedClass: null,
      selectedSubject: null,
      selectedTrimestre: null,
      classes: [],
      subjects: [],
      trimestres: [],
      students: [],
      existingGrades: [],
      isFormValid: false,
    };
    this.setup();
  }

  async setup() {
    try {
      this.container.innerHTML = "";

      if (!this.currentTeacher) {
        this.showError("Utilisateur non connecté");
        return;
      }

      await this.loadInitialData();
      this.createBanner();
      this.renderForm();
    } catch (error) {
      this.showError("Erreur de chargement des données");
    }
  }

  async loadInitialData() {
    const [classes, trimestres, subjects] = await Promise.all([
      this.controller.loadTeacherClasses(this.currentTeacher.id),
      this.controller.loadTrimestres(),
      this.controller.loadTeacherSubjects(this.currentTeacher.id), // Charger toutes les matières du prof
    ]);

    console.log(subjects);

    this.state.classes = classes;
    this.state.trimestres = trimestres;
    this.state.subjects = subjects;
    console.log(this.state.subjects);
  }

  createBanner() {
    const bannerConfig = {
      title: "Saisie des Notes",
      subtitle: "Saisissez et gérez les notes des élèves",
      primaryText: "Sélectionnez une classe, une matière et un trimestre",
      secondaryText: `Professeur: ${this.currentTeacher.prenom} ${this.currentTeacher.nom}`,
      icon: '<i class="ri-clipboard-line text-2xl text-blue-600"></i>',
      variant: "info",
      closable: true,
      timer: null,
    };

    this.banner = new Banner(bannerConfig);
    this.container.appendChild(this.banner.render());
  }

  renderForm() {
    const formContainer = document.createElement("div");
    formContainer.className = "p-6 bg-base-100 rounded-lg shadow-md";

    formContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Sélection de la classe -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Classe</span>
          </label>
          <select class="select select-bordered w-full" id="class-select">
            <option value="">Sélectionner une classe</option>
            ${this.state.classes
              .map((c) => `<option value="${c.id}">${c.nom}</option>`)
              .join("")}
          </select>
        </div>

        <!-- Sélection de la matière -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Matière</span>
          </label>
          <select class="select select-bordered w-full" id="subject-select">
            <option value="">Sélectionner une matière</option>
            ${this.state.subjects
              .map(
                (s) =>
                  `<option value="${s.subject.id}">${s.subject.nom}</option>`
              )
              .join("")}
          </select>
        </div>

        <!-- Sélection du trimestre -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Trimestre</span>
          </label>
          <select class="select select-bordered w-full" id="trimestre-select">
            <option value="">Sélectionner un trimestre</option>
            ${this.state.trimestres
              .map((t) => `<option value="${t.id}">${t.libelle}</option>`)
              .join("")}
          </select>
        </div>
      </div>

      <div class="flex justify-center">
        <button class="btn btn-primary" id="load-students-btn">
          <i class="ri-user-search-line mr-2"></i>
          Charger les élèves
        </button>
      </div>

      <div id="students-table-container" class="mt-8 hidden">
        <!-- Le tableau des élèves sera inséré ici -->
      </div>
    `;

    this.container.appendChild(formContainer);
    this.setupFormEvents();
  }

  setupFormEvents() {
    // Événement pour la sélection de la classe
    document.getElementById("class-select").addEventListener("change", (e) => {
      this.state.selectedClass = Number(e.target.value) || null;
      this.updateFormValidity();
    });

    document
      .getElementById("subject-select")
      .addEventListener("change", (e) => {
        this.state.selectedSubject = Number(e.target.value) || null;
        this.updateFormValidity();
      });

    document
      .getElementById("trimestre-select")
      .addEventListener("change", (e) => {
        this.state.selectedTrimestre = Number(e.target.value) || null;
        this.updateFormValidity();
      });

    // Événement pour le bouton de chargement
    document
      .getElementById("load-students-btn")
      .addEventListener("click", async () => {
        await this.loadStudentsData();
      });
  }

  updateFormValidity() {
    const isValid =
      this.state.selectedClass &&
      this.state.selectedSubject &&
      this.state.selectedTrimestre;

    console.log(isValid);

    // this.state.isFormValid = isValid;
    // document.getElementById("load-students-btn").disabled = !isValid;
  }

  async loadStudentsData() {
    try {
      console.log("➡ Charger étudiants avec :", {
        classe: this.state.selectedClass,
        subject: this.state.selectedSubject,
        trimestre: this.state.selectedTrimestre,
      });

      const [students, existingGrades] = await Promise.all([
        this.controller.loadStudentsByClass(this.state.selectedClass),
        this.controller.loadClassGrades(this.state.selectedClass, {
          subjectId: this.state.selectedSubject,
          trimestreId: this.state.selectedTrimestre,
        }),
      ]);

      console.log("✅ Étudiants :", students);
      console.log("✅ Notes existantes :", existingGrades);

      this.state.students = students;
      this.state.existingGrades = existingGrades;

      this.renderStudentsTable();
    } catch (error) {
      console.error(error);
      this.app.services.notifications.show(
        "Erreur lors du chargement des élèves",
        "error"
      );
    }
  }

  renderStudentsTable() {
    const container = document.getElementById("students-table-container");
    container.classList.remove("hidden");

    container.innerHTML = `
      <div class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="table table-zebra w-full">
          <thead>
            <tr class="bg-base-200">
              <th class="w-1/4">Élève</th>
              <th class="w-1/5">Devoir 1</th>
              <th class="w-1/5">Devoir 2</th>
              <th class="w-1/5">Composition</th>
              <th class="w-1/5">Moyenne</th>
            </tr>
          </thead>
          <tbody id="students-table-body">
            ${this.state.students
              .map((student) => this.getStudentRow(student))
              .join("")}
          </tbody>
        </table>
      </div>
      
      <div class="mt-6 flex justify-end gap-4">
        <button class="btn btn-ghost" id="cancel-btn">
          Annuler
        </button>
        <button class="btn btn-primary" id="save-grades-btn">
          <i class="ri-save-line mr-2"></i>
          Enregistrer les notes
        </button>
      </div>
    `;

    this.setupTableEvents();
  }

  getStudentRow(student) {
    const devoir1 = this.getGradeForStudent(student.id, "devoir");
    const devoir2 = this.getGradeForStudent(student.id, "devoir");
    const composition = this.getGradeForStudent(student.id, "composition");
    const moyenne = this.calculateAverage(devoir1, devoir2, composition);

    return `
      <tr data-student-id="${student.id}">
        <td>
          <div class="flex items-center">
            <div class="avatar placeholder mr-3">
              <div class="bg-neutral text-neutral-content rounded-full w-8">
                <span class="text-xs">${student.user.prenom[0]}${
      student.user.nom[0]
    }</span>
              </div>
            </div>
            <div>
              <div class="font-medium">${student.user.prenom} ${
      student.user.nom
    }</div>
              <div class="text-xs text-gray-500">${student.user.email}</div>
            </div>
          </div>
        </td>
        <td>
          <input type="number" 
                 class="input input-bordered input-sm w-20 grade-input" 
                 data-type="devoir1" 
                 data-student-id="${student.id}"
                 value="${devoir1 || ""}" 
                 min="0" 
                 max="20" 
                 step="0.5">
        </td>
        <td>
          <input type="number" 
                 class="input input-bordered input-sm w-20 grade-input" 
                 data-type="devoir2" 
                 data-student-id="${student.id}"
                 value="${devoir2 || ""}" 
                 min="0" 
                 max="20" 
                 step="0.5">
        </td>
        <td>
          <input type="number" 
                 class="input input-bordered input-sm w-20 grade-input" 
                 data-type="composition" 
                 data-student-id="${student.id}"
                 value="${composition || ""}" 
                 min="0" 
                 max="20" 
                 step="0.5">
        </td>
        <td>
          <span class="font-semibold ${
            moyenne ? "text-success" : "text-gray-400"
          }">
            ${moyenne ? moyenne.toFixed(2) : "N/A"}
          </span>
        </td>
      </tr>
    `;
  }

  getGradeForStudent(studentId, type) {
    const grade = this.state.existingGrades.find(
      (g) => g.studentId === studentId && g.type_note === type
    );
    return grade ? parseFloat(grade.note) : null;
  }

  calculateAverage(devoir1, devoir2, composition) {
    if (devoir1 === null && devoir2 === null && composition === null) {
      return null;
    }

    const devoirAvg =
      devoir1 !== null && devoir2 !== null
        ? (devoir1 + devoir2) / 2
        : devoir1 || devoir2 || 0;

    return composition !== null
      ? devoirAvg * 0.4 + composition * 0.6
      : devoirAvg;
  }

  setupTableEvents() {
    // Événements pour les inputs de notes
    document.querySelectorAll(".grade-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        this.updateStudentAverage(e.target);
      });
    });

    // Événement pour le bouton d'enregistrement
    document
      .getElementById("save-grades-btn")
      .addEventListener("click", async () => {
        await this.saveGrades();
      });

    // Événement pour le bouton d'annulation
    document.getElementById("cancel-btn").addEventListener("click", () => {
      this.resetForm();
    });
  }

  updateStudentAverage(input) {
    const studentId = input.getAttribute("data-student-id");
    const type = input.getAttribute("data-type");

    const devoir1Input = document.querySelector(
      `.grade-input[data-student-id="${studentId}"][data-type="devoir1"]`
    );
    const devoir2Input = document.querySelector(
      `.grade-input[data-student-id="${studentId}"][data-type="devoir2"]`
    );
    const compositionInput = document.querySelector(
      `.grade-input[data-student-id="${studentId}"][data-type="composition"]`
    );

    const devoir1 = devoir1Input.value ? parseFloat(devoir1Input.value) : null;
    const devoir2 = devoir2Input.value ? parseFloat(devoir2Input.value) : null;
    const composition = compositionInput.value
      ? parseFloat(compositionInput.value)
      : null;

    const moyenne = this.calculateAverage(devoir1, devoir2, composition);

    const averageCell = document.querySelector(
      `tr[data-student-id="${studentId}"] td:last-child`
    );
    averageCell.innerHTML = `
      <span class="font-semibold ${moyenne ? "text-success" : "text-gray-400"}">
        ${moyenne ? moyenne.toFixed(2) : "N/A"}
      </span>
    `;
  }

  async saveGrades() {
    try {
      const gradesData = this.collectGradesData();

      if (gradesData.length === 0) {
        this.app.services.notifications.show(
          "Aucune note à enregistrer",
          "info"
        );
        return;
      }

      await this.controller.saveGradesBatch({
        grades: gradesData,
        subjectId: this.state.selectedSubject,
        trimestreId: this.state.selectedTrimestre,
        anneeScolaireId: this.getCurrentAnneeScolaireId(),
      });

      this.app.services.notifications.show(
        "Notes enregistrées avec succès",
        "success"
      );

      // Recharger les données pour voir les modifications
      await this.loadStudentsData();
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de l'enregistrement",
        "error"
      );
    }
  }

  collectGradesData() {
    const grades = [];

    document.querySelectorAll(".grade-input").forEach((input) => {
      const value = input.value.trim();
      if (value) {
        const studentId = input.getAttribute("data-student-id");
        const type = input.getAttribute("data-type");
        const note = parseFloat(value);

        if (!isNaN(note) && note >= 0 && note <= 20) {
          grades.push({
            studentId: parseInt(studentId),
            type_note: type === "composition" ? "composition" : "devoir",
            note: note,
            subjectId: parseInt(this.state.selectedSubject),
            trimestreId: parseInt(this.state.selectedTrimestre),
            anneeScolaireId: this.getCurrentAnneeScolaireId(),
          });
        }
      }
    });

    return grades;
  }

  getCurrentAnneeScolaireId() {
    return 3; // Exemple
  }

  resetForm() {
    document.getElementById("students-table-container").classList.add("hidden");
    document.getElementById("class-select").value = "";
    document.getElementById("subject-select").value = "";
    document.getElementById("trimestre-select").value = "";

    this.state.selectedClass = null;
    this.state.selectedSubject = null;
    this.state.selectedTrimestre = null;
    this.state.students = [];
    this.state.existingGrades = [];
    this.state.isFormValid = false;

    this.updateFormValidity();
  }

  cleanup() {
    // Nettoyage des événements si nécessaire
  }
}
