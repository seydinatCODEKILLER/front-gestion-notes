export class TeacherController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("teachers");
    this.cache = {
      teachers: null,
      lastUpdated: null,
    };
  }

  async loadTeachers(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.teachers && this.isCacheValid()) {
        return this.cache.teachers;
      }

      const teachers = await this.service.getAllTeachers();
      this.cache.teachers = teachers;
      this.cache.lastUpdated = Date.now();
      return teachers;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les professeurs",
        "error"
      );
      throw error;
    }
  }

  async createTeacher(formData) {
    try {
      const result = await this.service.createTeacher(formData);
      this.clearCache();
      this.app.eventBus.publish("teachers:updated");
      this.app.services.notifications.show(
        "Professeur créé avec succès",
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

  async updateTeacher(id, data) {
    try {
      const result = await this.service.updateTeacher(id, data);
      this.clearCache();
      this.app.eventBus.publish("teachers:updated");
      this.app.services.notifications.show(
        "Professeur mis à jour avec succès",
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

  async deleteTeacher(id) {
    try {
      await this.service.softDeleteTeacher(id);
      this.clearCache();
      this.app.eventBus.publish("teachers:updated");
      this.app.services.notifications.show(
        "Professeur désactivé avec succès",
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

  async restoreTeacher(id) {
    try {
      await this.service.restoreTeacher(id);
      this.clearCache();
      this.app.eventBus.publish("teachers:updated");
      this.app.services.notifications.show(
        "Professeur activé avec succès",
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

  clearCache() {
    this.cache.teachers = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}
