import { AbstractService } from "@/app/abstract/AbstractService";

export class NiveauService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllNiveaux() {
    const response = await this.get("niveaux");
    return response.data;
  }

  async getNiveau(id) {
    const response = await this.get(`niveaux/${id}`);
    return response.data;
  }

  async createNiveau(data) {
    const response = await this.post("niveaux", data);
    return response.data;
  }

  async updateNiveau(id, data) {
    const response = await this.put(`niveaux/${id}`, data);
    return response.data;
  }

  async softDeleteNiveau(id) {
    const response = await this.patch(`niveaux/${id}/delete`);
    return response.data;
  }

  async restoreNiveau(id) {
    const response = await this.patch(`niveaux/${id}/restore`);
    return response.data;
  }

  async libelleExists(libelle) {
    try {
      const niveaux = await this.getAllNiveaux();
      return niveaux.some(n => n.libelle.toLowerCase() === libelle.toLowerCase());
    } catch (error) {
      console.error("Erreur lors de la vérification du libellé:", error);
      return false;
    }
  }
}