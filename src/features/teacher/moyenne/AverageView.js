import { ModernTable } from "@/components/table/Table.js";
import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { Modal } from "@/components/modal/Modal.js";

export class AverageView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("averages");
    this.selectedClass = null;
    this.selectedTrimestre = null;
    this.selectedSubject = null;
    this.currentTeacher = app.getService("auth").getCurrentUser();
    this.students = [];
    this.grades = [];
    this.averages = [];
  }

  async setup() {
    try {
      this.container.innerHTML = "";
      this.createBanner();
      this.renderFilters();
      //   this.renderContent();
    } catch (error) {
      console.log(error);
      this.showError("Erreur d'initialisation");
    }
  }

  createBanner() {
    const bannerConfig = {
      title: "Gestion des Moyennes",
      subtitle: "Calculez et gérez les moyennes des élèves",
      primaryText: "Sélectionnez une classe, un trimestre et une matière",
      icon: '<i class="ri-calculator-line text-2xl text-blue-600"></i>',
      variant: "info",
      closable: true,
    };

    this.banner = new Banner(bannerConfig);
    this.container.appendChild(this.banner.render());
  }

  async renderFilters() {
    const filtersContainer = document.createElement("div");
    filtersContainer.className = "bg-white p-6 rounded-lg shadow-md mb-6";

    try {
      const [classes, trimestres, subjects] = await Promise.all([
        this.controller.getClasses(this.currentTeacher.id),
        this.controller.getTrimestres(),
        this.controller.getSubjects(this.currentTeacher.id),
      ]);

      filtersContainer.innerHTML = `
      <h3 class="text-lg font-semibold mb-4">Sélection des filtres</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Classe -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Classe 📚</span>
          </label>
          <select class="select select-bordered select-primary" id="class-select" required>
            <option value="">Sélectionner une classe</option>
            ${classes
              .filter((c) => c.statut === "actif")
              .map(
                (c) => `
              <option value="${c.id}">${c.nom} - ${c.niveau?.libelle}</option>
            `
              )
              .join("")}
          </select>
        </div>

        <!-- Trimestre -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Trimestre 📅</span>
          </label>
          <select class="select select-bordered select-primary" id="trimestre-select" required>
            <option value="">Sélectionner un trimestre</option>
            ${trimestres
              .filter((t) => t.statut === "actif")
              .map(
                (t) => `
              <option value="${t.id}">${t.libelle}</option>
            `
              )
              .join("")}
          </select>
        </div>

        <!-- Matière -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Matière 🧮</span>
          </label>
          <select class="select select-bordered select-primary" id="subject-select" required>
            <option value="">Sélectionner une matière</option>
            ${subjects
              .filter((s) => s.subject.statut === "actif")
              .map(
                (s) => `
              <option value="${s.subject.id}">${s.subject.nom}</option>
            `
              )
              .join("")}
          </select>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end">
        <button class="btn btn-primary" id="load-data-btn" disabled>
          <i class="ri-download-line mr-2"></i>
          Charger les données
        </button>
      </div>
    `;

      this.container.appendChild(filtersContainer);

      // Setup event listeners
      this.setupFilterEvents();
    } catch (error) {
      console.log(error);
    }
  }

  setupFilterEvents() {
    const classSelect = this.container.querySelector("#class-select");
    const trimestreSelect = this.container.querySelector("#trimestre-select");
    const subjectSelect = this.container.querySelector("#subject-select");
    const loadButton = this.container.querySelector("#load-data-btn");

    const checkSelections = () => {
      const allSelected =
        classSelect.value && trimestreSelect.value && subjectSelect.value;
      loadButton.disabled = !allSelected;
    };

    [classSelect, trimestreSelect, subjectSelect].forEach((select) => {
      select.addEventListener("change", checkSelections);
    });

    loadButton.addEventListener("click", () => this.loadData());
  }

  async loadData() {
    try {
      const classId = this.container.querySelector("#class-select").value;
      const trimestreId =
        this.container.querySelector("#trimestre-select").value;
      const subjectId = this.container.querySelector("#subject-select").value;

      this.selectedClass = classId;
      this.selectedTrimestre = trimestreId;
      this.selectedSubject = subjectId;

      // Charger les étudiants de la classe
      const classData = await this.controller.getClassesWithStudents(classId);
      console.log(classData);
      this.students = classData.students || [];

      // Charger les notes et moyennes en parallèle
      const [grades, averages] = await Promise.all([
        this.controller.loadClassGrades(classId, trimestreId, subjectId),
        this.controller.loadClassAverages(classId, trimestreId, subjectId),
      ]);

      this.grades = grades;
      this.averages = averages;

      this.renderResults();
    } catch (error) {
      console.log(error.message);

      this.app.services.notifications.show(
        "Erreur lors du chargement des données",
        "error"
      );
    }
  }

  renderResults() {
    const resultsContainer = document.createElement("div");
    resultsContainer.className = "bg-white p-6 rounded-lg shadow-md";
    resultsContainer.id = "results-container";

    if (this.students.length === 0) {
      resultsContainer.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="ri-user-search-line text-4xl mb-2"></i>
          <p>Aucun élève trouvé dans cette classe</p>
        </div>
      `;
      this.container.appendChild(resultsContainer);
      return;
    }

    // Préparer les données pour le tableau
    const tableData = this.prepareTableData();
    const valid = tableData.map((item) => ({ ...item, id: item.studentId }));
    console.log(valid);

    const canCalculateAll = this.controller.canCalculateAllAverages(
      this.grades,
      this.students
    );
    const hasUpdates = this.grades.some((grade) => grade.updated); // Suppose que les notes ont un flag updated

    resultsContainer.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Résultats</h3>
        <div class="flex gap-2">
          ${
            hasUpdates
              ? `
            <button class="btn btn-warning btn-sm" id="recalculate-btn">
              <i class="ri-refresh-line mr-1"></i>
              Recalculer les moyennes
            </button>
          `
              : ""
          }
          <button class="btn btn-primary btn-sm" id="calculate-all-btn" ${
            canCalculateAll ? "" : "disabled"
          }>
            <i class="ri-calculator-line mr-1"></i>
            Calculer toutes les moyennes
          </button>
        </div>
      </div>
    `;

    const table = new ModernTable({
      itemsPerPage: 10,
      columns: this.getTableColumns(),
      data: valid,
      actions: {
        displayMode: "direct",
        items: [
          {
            name: "calculate",
            icon: "ri-calculator-line",
            className: "btn-success",
            visible: (item) =>
              this.controller.hasAllRequiredGrades(this.grades, item.studentId),
            action: "calculate",
          },
        ],
      },
      onAction: (action, studentId) => this.handleAction(action, studentId),
    });

    resultsContainer.appendChild(table.render());
    setTimeout(() => {
      table.update(valid, 1);
    }, 0);

    this.setupActionButtons(resultsContainer);

    this.container.appendChild(resultsContainer);
  }

  prepareTableData() {
    return this.students.map((student) => {
      const studentGrades = this.grades.filter(
        (g) => g.studentId === student.id
      );
      const average = this.averages.find((a) => a.studentId === student.id);

      // Récupérer les devoirs
      const devoirs = studentGrades
        .filter((g) => g.type_note === "devoir")
        .sort(
          (a, b) => new Date(a.date_evaluation) - new Date(b.date_evaluation)
        );
      // 👆 si tu as un champ date pour ordonner, sinon tu enlèves ce sort

      // Récupérer la composition
      const composition = studentGrades.find(
        (g) => g.type_note === "composition"
      );

      return {
        studentId: student.id,
        studentName: `${student.user.nom} ${student.user.prenom}`,
        devoir1: devoirs[0]?.note || "-",
        devoir2: devoirs[1]?.note || "-",
        composition: composition?.note || "-",
        moyenne: average?.moyenne || "-",
        hasAllGrades: this.controller.hasAllRequiredGrades(
          this.grades,
          student.id
        ),
      };
    });
  }

  getTableColumns() {
    return [
      {
        header: "Élève",
        key: "studentName",
        sortable: true,
      },
      {
        header: "Devoir 1",
        key: "devoir1",
        render: (item) => this.renderGrade(item.devoir1),
      },
      {
        header: "Devoir 2",
        key: "devoir2",
        render: (item) => this.renderGrade(item.devoir2),
      },
      {
        header: "Composition",
        key: "composition",
        render: (item) => this.renderGrade(item.composition),
      },
      {
        header: "Moyenne",
        key: "moyenne",
        render: (item) => this.renderAverage(item.moyenne),
      },
      {
        header: "Action",
        key: "actions",
        sortable: false,
        render: (item) => this.renderActionButton(item),
      },
    ];
  }

  renderGrade(grade) {
    if (grade === "-") return '<span class="text-gray-400">-</span>';
    const numericGrade = parseFloat(grade);
    let colorClass = "text-gray-700";

    if (numericGrade < 10) colorClass = "text-red-600 font-semibold";
    else if (numericGrade >= 16) colorClass = "text-green-600 font-semibold";

    return `<span class="${colorClass}">${grade}/20</span>`;
  }

  renderAverage(average) {
    if (average === "-") return '<span class="text-gray-400">-</span>';
    const numericAvg = parseFloat(average);
    let colorClass = "text-gray-700 font-semibold";

    if (numericAvg < 10) colorClass = "text-red-600 font-semibold";
    else if (numericAvg >= 16) colorClass = "text-green-600 font-semibold";

    return `<span class="${colorClass}">${average}/20</span>`;
  }

  renderActionButton(item) {
    const canCalculate = this.controller.hasAllRequiredGrades(
      this.grades,
      item.studentId
    );
    console.log(item);
    const hasAverage = item.moyenne !== "-";

    if (!canCalculate) {
      return '<span class="text-gray-400 text-sm">Notes manquantes</span>';
    }

    if (hasAverage) {
      return '<span class="text-green-600 text-sm">✓ Calculée</span>';
    }

    return `
      <button class="btn btn-success btn-xs calculate-btn" data-student-id="${item.studentId}">
        <i class="ri-calculator-line mr-1"></i>
        Calculer
      </button>
    `;
  }

  setupActionButtons(container) {
    // Boutons de calcul individuel
    container.querySelectorAll(".calculate-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const button = e.target.closest(".calculate-btn");
        if (!button) return; // Sécurité
        const studentId = Number(button.dataset.studentId);
        this.calculateStudentAverage(studentId);
      });
    });

    // Bouton calcul global
    container
      .querySelector("#calculate-all-btn")
      ?.addEventListener("click", () => {
        this.calculateAllAverages();
      });

    // Bouton recalcul
    container
      .querySelector("#recalculate-btn")
      ?.addEventListener("click", () => {
        this.calculateUpdatedAverages();
      });
  }

  async calculateStudentAverage(studentId) {
    try {
      const newAverage = await this.controller.calculateStudentAverage(
        studentId,
        this.selectedSubject,
        this.selectedTrimestre
      );

      // Mettre à jour localement l'array des moyennes
      const index = this.averages.findIndex((a) => a.studentId === studentId);
      if (index !== -1) {
        this.averages[index].moyenne = newAverage.moyenne;
      } else {
        this.averages.push(newAverage);
      }

      // Mettre à jour uniquement la ligne du tableau
      const row = this.container
        .querySelector(`.calculate-btn[data-student-id="${studentId}"]`)
        .closest("tr");
      if (row) {
        const moyenneCell = row.querySelector("td:nth-child(5)"); // la colonne moyenne
        moyenneCell.innerHTML = this.renderAverage(newAverage.moyenne);

        // Mettre à jour le bouton d'action
        row.querySelector("td:last-child").innerHTML =
          '<span class="text-green-600 text-sm">✓ Calculée</span>';
      }
    } catch (error) {
      console.error("Erreur lors du calcul de la moyenne:", error);
    }
  }

  async calculateAllAverages() {
    try {
      await this.controller.calculateAllAverages(
        this.selectedClass,
        this.selectedSubject,
        this.selectedTrimestre
      );

      // Recharger les données
      await this.loadData();
    } catch (error) {
      console.error("Erreur lors du calcul des moyennes:", error);
    }
  }

  async calculateUpdatedAverages() {
    try {
      await this.controller.calculateUpdatedAverages(
        this.selectedClass,
        this.selectedSubject,
        this.selectedTrimestre
      );

      // Recharger les données
      await this.loadData();
    } catch (error) {
      console.error("Erreur lors du recalcul des moyennes:", error);
    }
  }

  handleAction(action, studentId) {
    if (action === "calculate") {
      this.calculateStudentAverage(studentId);
    }
  }

  cleanup() {
    this.controller.clearCache();
  }
}
