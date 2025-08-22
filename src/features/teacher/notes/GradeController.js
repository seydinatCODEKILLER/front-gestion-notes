export class GradeController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("grades");
    this.studentService = app.getService("classes");
    this.evaluationService = app.getService("evaluations");
    this.cache = {
      grades: null,
      lastUpdated: null,
    };
  }

  async loadEvaluationGrades(evaluationId, forceRefresh = false) {
    try {
      const cacheKey = `evaluation-${evaluationId}`;

      if (!forceRefresh && this.cache[cacheKey] && this.isCacheValid()) {
        return this.cache[cacheKey];
      }

      // Implémentation dépendante de l'API backend
      // Pour l'instant, on suppose qu'on peut filtrer par évaluation
      const evaluation = await this.evaluationService.getEvaluation(
        evaluationId
      );
      const classGrades = await this.service.getClassGrades(evaluation.classId);
      console.log(classGrades)

      const evaluationGrades = classGrades.filter(
        (grade) => grade.evaluationId == evaluationId
      );
      console.log(evaluationGrades);

      this.cache[cacheKey] = evaluationGrades;
      this.cache.lastUpdated = Date.now();
      return evaluationGrades;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les notes de l'évaluation",
        "error"
      );
      throw error;
    }
  }

  async getStudentsByClass(classId) {
    try {
      return await this.studentService.getClassWithStudents(classId);
    } catch (error) {
      console.error("Erreur lors du chargement des élèves:", error);
      return [];
    }
  }

  async createGrades(gradesData) {
    try {
      const results = [];
      for (const gradeData of gradesData) {
        const result = await this.service.createGrade(gradeData);
        results.push(result);
      }

      this.clearCache();
      this.app.eventBus.publish("grades:updated");
      this.app.services.notifications.show(
        "Notes enregistrées avec succès",
        "success"
      );
      return results;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de l'enregistrement des notes";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async updateGrades(gradesData) {
    try {
      const results = [];
      for (const gradeData of gradesData) {
        if (gradeData.id) {
          const result = await this.service.updateGrade(
            gradeData.id,
            gradeData
          );
          results.push(result);
        } else {
          const result = await this.service.createGrade(gradeData);
          results.push(result);
        }
      }

      this.clearCache();
      this.app.eventBus.publish("grades:updated");
      this.app.services.notifications.show(
        "Notes mises à jour avec succès",
        "success"
      );
      return results;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour des notes";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async deleteGrade(id) {
    try {
      await this.service.deleteGrade(id);
      this.clearCache();
      this.app.eventBus.publish("grades:updated");
      this.app.services.notifications.show(
        "Note supprimée avec succès",
        "success"
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la suppression";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  clearCache() {
    Object.keys(this.cache)
      .filter((key) => key.startsWith("evaluation-"))
      .forEach((key) => delete this.cache[key]);
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}
