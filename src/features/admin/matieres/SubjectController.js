export class SubjectController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("subjects");
    this.niveauService = app.getService("niveaux");
    this.cache = {
      subjects: null,
      lastUpdated: null,
    };
  }

  async loadSubjects(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.subjects && this.isCacheValid()) {
        return this.cache.subjects;
      }

      const subjects = await this.service.getAllSubjects();
      this.cache.subjects = subjects;
      this.cache.lastUpdated = Date.now();
      return subjects;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les matières",
        "error"
      );
      throw error;
    }
  }

  async createSubject(formData) {
    try {
      const result = await this.service.createSubject(formData);
      this.clearCache();
      this.app.eventBus.publish("subjects:updated");
      this.app.services.notifications.show(
        "Matière créée avec succès",
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

  async updateSubject(id, data) {
    try {
      const result = await this.service.updateSubject(id, data);
      this.clearCache();
      this.app.eventBus.publish("subjects:updated");
      this.app.services.notifications.show(
        "Matière mise à jour avec succès",
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

  async deleteSubject(id) {
    try {
      await this.service.softDeleteSubject(id);
      this.clearCache();
      this.app.eventBus.publish("subjects:updated");
      this.app.services.notifications.show(
        "Matière désactivée avec succès",
        "success"
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la désactivation";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async restoreSubject(id) {
    try {
      await this.service.restoreSubject(id);
      this.clearCache();
      this.app.eventBus.publish("subjects:updated");
      this.app.services.notifications.show(
        "Matière activée avec succès",
        "success"
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de l'activation";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async getNiveaux() {
    try {
      return await this.niveauService.getAllNiveaux();
    } catch (error) {
      console.error("Erreur lors du chargement des niveaux:", error);
      return [];
    }
  }

  async loadTeacherSubjects(teacherId, forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.subjects && this.isCacheValid()) {
        return this.cache.subjects;
      }

      const subjects = await this.service.getSubjectsByTeacher(teacherId);
      this.cache.subjects = subjects;
      this.cache.lastUpdated = Date.now();
      return subjects;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger vos matières",
        "error"
      );
      throw error;
    }
  }

  clearCache() {
    this.cache.subjects = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}
