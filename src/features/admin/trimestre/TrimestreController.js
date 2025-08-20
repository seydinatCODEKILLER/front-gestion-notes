export class TrimestreController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("trimestres");
    this.anneeScolaireService = app.getService("annee_scolaire");
    this.cache = {
      trimestres: null,
      lastUpdated: null,
    };
  }

  async loadTrimestres(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.trimestres && this.isCacheValid()) {
        return this.cache.trimestres;
      }

      const trimestres = await this.service.getAllTrimestres();
      this.cache.trimestres = trimestres;
      this.cache.lastUpdated = Date.now();
      return trimestres;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les trimestres",
        "error"
      );
      throw error;
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

  async createTrimestre(formData) {
    try {
      const result = await this.service.createTrimestre(formData);
      this.clearCache();
      this.app.eventBus.publish("trimestres:updated");
      this.app.services.notifications.show(
        "Trimestre créé avec succès",
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

  async updateTrimestre(id, data) {
    try {
      const result = await this.service.updateTrimestre(id, data);
      this.clearCache();
      this.app.eventBus.publish("trimestres:updated");
      this.app.services.notifications.show(
        "Trimestre mis à jour avec succès",
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

  async deleteTrimestre(id) {
    try {
      await this.service.softDeleteTrimestre(id);
      this.clearCache();
      this.app.eventBus.publish("trimestres:updated");
      this.app.services.notifications.show(
        "Trimestre désactivé avec succès",
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

  async restoreTrimestre(id) {
    try {
      await this.service.restoreTrimestre(id);
      this.clearCache();
      this.app.eventBus.publish("trimestres:updated");
      this.app.services.notifications.show(
        "Trimestre activé avec succès",
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
    this.cache.trimestres = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}
