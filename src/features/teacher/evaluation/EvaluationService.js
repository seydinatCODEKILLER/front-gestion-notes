import { AbstractService } from "@/app/abstract/AbstractService";

export class EvaluationService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllEvaluations() {
    const response = await this.get("/api/evaluations");
    return response.data;
  }

  async getEvaluation(id) {
    const response = await this.get(`/api/evaluations/${id}`);
    return response.data;
  }

  async getEvaluationsByClass(classId) {
    const response = await this.get(`/api/evaluations/class/${classId}`);
    return response.data;
  }

  async getEvaluationsByTeacher(teacherId) {
    const response = await this.get(`/api/evaluations/teacher/${teacherId}`);
    return response.data;
  }

  async getEvaluationStats(id) {
    const response = await this.get(`/api/evaluations/${id}/stats`);
    return response.data;
  }

  async createEvaluation(data) {
    const response = await this.post("/api/evaluations", data);
    return response.data;
  }

  async updateEvaluation(id, data) {
    const response = await this.put(`/api/evaluations/${id}`, data);
    return response.data;
  }

  async deleteEvaluation(id) {
    const response = await this.delete(`/api/evaluations/${id}`);
    return response.data;
  }

  async titleExists(titre, classId, dateEvaluation) {
    try {
      const evaluations = await this.getEvaluationsByClass(classId);
      return evaluations.some(
        (e) =>
          e.titre.toLowerCase() === titre.toLowerCase() &&
          new Date(e.date_evaluation).toDateString() ===
            new Date(dateEvaluation).toDateString()
      );
    } catch (error) {
      console.error("Erreur lors de la vérification du titre:", error);
      return false;
    }
  }
}
