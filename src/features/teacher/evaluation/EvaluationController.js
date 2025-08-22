export class EvaluationController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("evaluations");
    this.classService = app.getService("classes");
    this.subjectService = app.getService("subjects");
    this.trimestreService = app.getService("trimestres");
    this.anneeScolaireService = app.getService("annee_scolaire");
    this.cache = {
      evaluations: null,
      lastUpdated: null,
    };
  }

  async loadEvaluations(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.evaluations && this.isCacheValid()) {
        return this.cache.evaluations;
      }

      const evaluations = await this.service.getAllEvaluations();
      this.cache.evaluations = evaluations;
      this.cache.lastUpdated = Date.now();
      return evaluations;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les évaluations",
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

  async getAnneesScolaires() {
    try {
      return await this.anneeScolaireService.getAllAnneesScolaires();
    } catch (error) {
      console.error("Erreur lors du chargement des années scolaires:", error);
      return [];
    }
  }

  async createEvaluation(formData) {
    try {
      const result = await this.service.createEvaluation(formData);
      this.clearCache();
      this.app.eventBus.publish("evaluations:updated");
      this.app.services.notifications.show(
        "Évaluation créée avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la création";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async updateEvaluation(id, data) {
    try {
      const result = await this.service.updateEvaluation(id, data);
      this.clearCache();
      this.app.eventBus.publish("evaluations:updated");
      this.app.services.notifications.show(
        "Évaluation mise à jour avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async deleteEvaluation(id) {
    try {
      await this.service.deleteEvaluation(id);
      this.clearCache();
      this.app.eventBus.publish("evaluations:updated");
      this.app.services.notifications.show(
        "Évaluation supprimée avec succès",
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

  async loadClassEvaluations(classId, forceRefresh = false) {
    try {
      const cacheKey = `class-${classId}`;

      if (!forceRefresh && this.cache[cacheKey] && this.isCacheValid()) {
        return this.cache[cacheKey];
      }

      const evaluations = await this.service.getEvaluationsByClass(classId);
      this.cache[cacheKey] = evaluations;
      this.cache.lastUpdated = Date.now();
      return evaluations;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les évaluations de la classe",
        "error"
      );
      throw error;
    }
  }

  async loadTeacherEvaluations(teacherId, forceRefresh = false) {
    try {
      const cacheKey = `teacher-${teacherId}`;

      if (!forceRefresh && this.cache[cacheKey] && this.isCacheValid()) {
        return this.cache[cacheKey];
      }

      const evaluations = await this.service.getEvaluationsByTeacher(teacherId);
      this.cache[cacheKey] = evaluations;
      this.cache.lastUpdated = Date.now();
      return evaluations;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger vos évaluations",
        "error"
      );
      throw error;
    }
  }

  clearCache() {
    this.cache.evaluations = null;
    Object.keys(this.cache)
      .filter((key) => key.startsWith("class-") || key.startsWith("teacher-"))
      .forEach((key) => delete this.cache[key]);
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}
