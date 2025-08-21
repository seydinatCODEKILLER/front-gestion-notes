export class TeacherSubjectController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("teacherSubjects");
    this.teacherService = app.getService("teachers");
    this.subjectService = app.getService("subjects");
    this.cache = {
      associations: null,
      lastUpdated: null,
    };
  }

  async loadAssociations(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.associations && this.isCacheValid()) {
        return this.cache.associations;
      }

      const associations = await this.service.getAllAssociations();
      this.cache.associations = associations;
      this.cache.lastUpdated = Date.now();
      return associations;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les affectations",
        "error"
      );
      throw error;
    }
  }

  async getTeacherSubjects(teacherId) {
    try {
      return await this.service.getTeacherSubjects(teacherId);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors du chargement des matières du professeur";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async assignSubject(data) {
    try {
      const result = await this.service.assignSubject(data);
      this.clearCache();
      this.app.eventBus.publish("teacher-subjects:updated");
      this.app.services.notifications.show(
        "Matière affectée avec succès",
        "success"
      );
      return result;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de l'affectation";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async removeAssignment(id) {
    try {
      await this.service.removeAssignment(id);
      this.clearCache();
      this.app.eventBus.publish("teacher-subjects:updated");
      this.app.services.notifications.show(
        "Affectation supprimée avec succès",
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

  async getAllTeachers() {
    try {
      return await this.teacherService.getAllTeachers();
    } catch (error) {
      console.error("Erreur lors du chargement des professeurs:", error);
      return [];
    }
  }

  async getAllSubjects() {
    try {
      return await this.subjectService.getAllSubjects();
    } catch (error) {
      console.error("Erreur lors du chargement des matières:", error);
      return [];
    }
  }

  clearCache() {
    this.cache.associations = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}
