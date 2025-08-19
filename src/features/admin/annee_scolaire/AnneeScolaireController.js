export class AnneeScolaireController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("annee_scolaire");
    this.cache = {
      annees: null,
      lastUpdated: null,
    };
  }

  async loadAnneesScolaires(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.annees && this.isCacheValid()) {
        return this.cache.annees;
      }

      const annees = await this.service.getAllAnneesScolaires();
      this.cache.annees = annees;
      this.cache.lastUpdated = Date.now();
      return annees;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les années scolaires",
        "error"
      );
      throw error;
    }
  }

  async createAnneeScolaire(formData) {
    try {
      const result = await this.service.createAnneeScolaire(formData);
      this.clearCache();
      this.app.eventBus.publish("annees_scolaires:updated");
      this.app.services.notifications.show(
        "Année scolaire créée avec succès",
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

  async updateAnneeScolaire(id, data) {
    try {
      const result = await this.service.updateAnneeScolaire(id, data);
      this.clearCache();
      this.app.eventBus.publish("annees_scolaires:updated");
      this.app.services.notifications.show(
        "Année scolaire mise à jour avec succès",
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

  async activateAnneeScolaire(id) {
    try {
      await this.service.activateAnneeScolaire(id);
      this.clearCache();
      this.app.eventBus.publish("annees_scolaires:updated");
      this.app.services.notifications.show(
        "Année scolaire activée avec succès",
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

  async desactivateAnneeScolaire(id) {
    try {
      await this.service.desactivateAnneeScolaire(id);
      this.clearCache();
      this.app.eventBus.publish("annees_scolaires:updated");
      this.app.services.notifications.show(
        "Année scolaire désactivée avec succès",
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

  clearCache() {
    this.cache.annees = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}
