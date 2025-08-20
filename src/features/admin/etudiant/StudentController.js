export class StudentController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("students");
    this.classeService = app.getService("classes");
    this.niveauService = app.getService("niveaux");
    this.anneeScolaireService = app.getService("annee_scolaire");
    this.cache = {
      students: null,
      lastUpdated: null,
    };
  }

  async loadStudents(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.students && this.isCacheValid()) {
        return this.cache.students;
      }

      const students = await this.service.getAllStudents();
      this.cache.students = students;
      this.cache.lastUpdated = Date.now();
      return students;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les élèves",
        "error"
      );
      throw error;
    }
  }

  async getClasses() {
    try {
      return await this.classeService.getAllClasses();
    } catch (error) {
      console.error("Erreur lors du chargement des classes:", error);
      return [];
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

  async getAnneesScolaires() {
    try {
      return await this.anneeScolaireService.getAllAnneesScolaires();
    } catch (error) {
      console.error("Erreur lors du chargement des années scolaires:", error);
      return [];
    }
  }

  async createStudent(formData) {
    try {
      const result = await this.service.createStudent(formData);
      this.clearCache();
      this.app.eventBus.publish("students:updated");
      this.app.services.notifications.show("Élève créé avec succès", "success");
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

  async updateStudent(id, data) {
    try {
      const result = await this.service.updateStudent(id, data);
      this.clearCache();
      this.app.eventBus.publish("students:updated");
      this.app.services.notifications.show(
        "Élève mis à jour avec succès",
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

  async deleteStudent(id) {
    try {
      await this.service.softDeleteStudent(id);
      this.clearCache();
      this.app.eventBus.publish("students:updated");
      this.app.services.notifications.show(
        "Élève désactivé avec succès",
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

  async restoreStudent(id) {
    try {
      await this.service.restoreStudent(id);
      this.clearCache();
      this.app.eventBus.publish("students:updated");
      this.app.services.notifications.show(
        "Élève activé avec succès",
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
    this.cache.students = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}
