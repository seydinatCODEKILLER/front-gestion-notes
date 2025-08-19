import { AbstractService } from "@/app/abstract/AbstractService";

export class AnneeScolaireService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getCurrent() {
    try {
      const response = await this.get("/api/annees/active");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAllAnneesScolaires() {
    const response = await this.get("/api/annees");
    return response.data;
  }

  async getAnneeScolaire(id) {
    const response = await this.get(`/api/annees/${id}`);
    return response.data;
  }

  async createAnneeScolaire(data) {
    const response = await this.post("/api/annees", data);
    return response.data;
  }

  async updateAnneeScolaire(id, data) {
    const response = await this.put(`/api/annees/${id}`, data);
    return response.data;
  }

  async activateAnneeScolaire(id) {
    const response = await this.patch(`/api/annees/${id}/restore`);
    return response.data;
  }

  async desactivateAnneeScolaire(id) {
    const response = await this.patch(`/api/annees/${id}/delete`);
    return response.data;
  }

  async libelleExists(libelle) {
    try {
      const annees = await this.getAllAnneesScolaires();
      return annees.some(
        (a) => a.libelle.toLowerCase() === libelle.toLowerCase()
      );
    } catch (error) {
      console.error("Erreur lors de la vérification du libellé:", error);
      return false;
    }
  }

}