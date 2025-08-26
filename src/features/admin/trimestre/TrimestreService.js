import { AbstractService } from "@/app/abstract/AbstractService";

export class TrimestreService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllTrimestres() {
    const response = await this.get("trimestres");
    return response.data;
  }

  async getCurrent() {
    const response = await this.get("trimestres/current");
    return response.data;
  }

  async getTrimestre(id) {
    const response = await this.get(`trimestres/${id}`);
    return response.data;
  }

  async createTrimestre(data) {
    const response = await this.post("trimestres", data);
    return response.data;
  }

  async updateTrimestre(id, data) {
    const response = await this.put(`trimestres/${id}`, data);
    return response.data;
  }

  async softDeleteTrimestre(id) {
    const response = await this.patch(`trimestres/${id}/delete`);
    return response.data;
  }

  async restoreTrimestre(id) {
    const response = await this.patch(`trimestres/${id}/restore`);
    return response.data;
  }

  async libelleExists(libelle, anneeScolaireId) {
    try {
      const trimestres = await this.getAllTrimestres();
      return trimestres.some(t => 
        t.libelle.toLowerCase() === libelle.toLowerCase() && 
        t.anneeScolaireId === anneeScolaireId
      );
    } catch (error) {
      console.error("Erreur lors de la vérification du libellé:", error);
      return false;
    }
  }
}