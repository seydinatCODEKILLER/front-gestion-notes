export class NiveauController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("niveaux");
    this.cache = {
      niveaux: null,
      lastUpdated: null,
    };
  }

  async loadNiveaux(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.niveaux && this.isCacheValid()) {
        return this.cache.niveaux;
      }

      const niveaux = await this.service.getAllNiveaux();
      this.cache.niveaux = niveaux;
      this.cache.lastUpdated = Date.now();
      return niveaux;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les niveaux",
        "error"
      );
      throw error;
    }
  }

  async createNiveau(formData) {
    try {
      const result = await this.service.createNiveau(formData);
      this.clearCache();
      this.app.eventBus.publish("niveaux:updated");
      this.app.services.notifications.show(
        "Niveau créé avec succès",
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

  async updateNiveau(id, data) {
    try {
      const result = await this.service.updateNiveau(id, data);
      this.clearCache();
      this.app.eventBus.publish("niveaux:updated");
      this.app.services.notifications.show(
        "Niveau mis à jour avec succès",
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

  async deleteNiveau(id) {
    try {
      await this.service.softDeleteNiveau(id);
      this.clearCache();
      this.app.eventBus.publish("niveaux:updated");
      this.app.services.notifications.show(
        "Niveau désactivé avec succès",
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

  async restoreNiveau(id) {
    try {
      await this.service.restoreNiveau(id);
      this.clearCache();
      this.app.eventBus.publish("niveaux:updated");
      this.app.services.notifications.show(
        "Niveau activé avec succès",
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
    this.cache.niveaux = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
  
}
