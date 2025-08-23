export class AverageController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("averages");
    this.gradeService = app.getService("grades");
    this.classService = app.getService("classes");
    this.subjectService = app.getService("subjects");
    this.trimestreService = app.getService("trimestres");
    this.cache = new Map();
  }

  async loadClassAverages(classId, trimestreId, subjectId) {
    const cacheKey = `averages-${classId}-${trimestreId}-${subjectId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const averages = await this.service.getClassAverages(classId, {
        trimestreId,
        subjectId,
      });

      this.cache.set(cacheKey, averages);
      return averages;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les moyennes",
        "error"
      );
      throw error;
    }
  }

  async loadClassGrades(classId, trimestreId, subjectId) {
    const cacheKey = `grades-${classId}-${trimestreId}-${subjectId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const grades = await this.gradeService.getClassGrades(classId, {
        trimestreId,
        subjectId,
      });

      this.cache.set(cacheKey, grades);
      return grades;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les notes",
        "error"
      );
      throw error;
    }
  }

  async getClasses(teacherId) {
    try {
      return await this.classService.getClassesByTeacher(teacherId);
    } catch (error) {
      console.error("Erreur lors du chargement des classes:", error);
      return [];
    }
  }

  async getClassesWithStudents(classId) {
    try {
      return await this.classService.getClassWithStudents(classId);
    } catch (error) {
      console.error("Erreur lors du chargement des classes:", error);
      return [];
    }
  }

  async getSubjects(tacherId) {
    try {
      return await this.subjectService.getSubjectsByTeacher(tacherId);
    } catch (error) {
      console.error("Erreur lors du chargement des matières:", error);
      return [];
    }
  }

  async getTrimestres() {
    try {
      return await this.trimestreService.getAllTrimestres();
    } catch (error) {
      console.error("Erreur lors du chargement des trimestres:", error);
      return [];
    }
  }

  async calculateStudentAverage(studentId, subjectId, trimestreId) {
    try {
      const result = await this.service.createOrUpdateAverage({
        studentId,
        subjectId,
        trimestreId,
      });

      this.clearCache();
      this.app.eventBus.publish("averages:updated");
      this.app.services.notifications.show(
        "Moyenne calculée avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors du calcul de la moyenne";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async calculateAllAverages(classId, subjectId, trimestreId) {
    try {
      const result = await this.service.calculateClassAverages(classId, {
        subjectId,
        trimestreId,
      });

      this.clearCache();
      this.app.eventBus.publish("averages:updated");
      this.app.services.notifications.show(
        result.message || "Moyennes calculées avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors du calcul des moyennes";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async calculateUpdatedAverages(classId, subjectId, trimestreId) {
    try {
      const result = await this.service.calculateUpdatedAverages(classId, {
        subjectId,
        trimestreId,
      });

      this.clearCache();
      this.app.eventBus.publish("averages:updated");
      this.app.services.notifications.show(
        result.message || "Moyennes recalculées avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors du recalcul des moyennes";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }

  hasAllRequiredGrades(grades, studentId) {
    const studentGrades = grades.filter(
      (grade) => grade.studentId === studentId
    );
    const hasDevoir1 = studentGrades.some((g) => g.type_note === "devoir");
    const hasDevoir2 =
      studentGrades.filter((g) => g.type_note === "devoir").length >= 2;
    const hasComposition = studentGrades.some(
      (g) => g.type_note === "composition"
    );

    return hasDevoir1 && hasDevoir2 && hasComposition;
  }

  canCalculateAllAverages(grades, students) {
    return students.every((student) =>
      this.hasAllRequiredGrades(grades, student.id)
    );
  }
}
