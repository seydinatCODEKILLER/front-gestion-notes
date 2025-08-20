export class ClassController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("classes");
    this.niveauService = app.getService("niveaux");
    this.anneeScolaireService = app.getService("annee_scolaire");
    this.cache = {
      classes: null,
      lastUpdated: null,
    };
  }

  async loadClasses(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.classes && this.isCacheValid()) {
        return this.cache.classes;
      }

      const classes = await this.service.getAllClasses();
      this.cache.classes = classes;
      this.cache.lastUpdated = Date.now();
      return classes;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les classes",
        "error"
      );
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

  async getAnneesScolaires() {
    try {
      return await this.anneeScolaireService.getAllAnneesScolaires();
    } catch (error) {
      console.error("Erreur lors du chargement des années scolaires:", error);
      return [];
    }
  }

  async createClass(formData) {
    try {
      const result = await this.service.createClass(formData);
      this.clearCache();
      this.app.eventBus.publish("classes:updated");
      this.app.services.notifications.show(
        "Classe créée avec succès",
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

  async updateClass(id, data) {
    try {
      const result = await this.service.updateClass(id, data);
      this.clearCache();
      this.app.eventBus.publish("classes:updated");
      this.app.services.notifications.show(
        "Classe mise à jour avec succès",
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

  async deleteClass(id) {
    try {
      await this.service.softDeleteClass(id);
      this.clearCache();
      this.app.eventBus.publish("classes:updated");
      this.app.services.notifications.show(
        "Classe désactivée avec succès",
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

  async restoreClass(id) {
    try {
      await this.service.restoreClass(id);
      this.clearCache();
      this.app.eventBus.publish("classes:updated");
      this.app.services.notifications.show(
        "Classe activée avec succès",
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
    this.cache.classes = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}
