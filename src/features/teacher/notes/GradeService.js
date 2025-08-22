import { AbstractService } from "@/app/abstract/AbstractService";

export class GradeService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async createGrade(data) {
    const response = await this.post("/api/grades", data);
    return response.data;
  }

  async updateGrade(id, data) {
    const response = await this.put(`/api/grades/${id}`, data);
    return response.data;
  }

  async deleteGrade(id) {
    const response = await this.delete(`/api/grades/${id}`);
    return response.data;
  }

  async getStudentGrades(studentId) {
    const response = await this.get(`/api/grades/student/${studentId}`);
    return response.data;
  }

  async getClassGrades(classId) {
    const response = await this.get(`/api/grades/class/${classId}`);
    return response.data;
  }

  async getEvaluationGrades(evaluationId) {
    try {
      // Cette méthode pourrait nécessiter un endpoint spécifique ou filtrer les notes par évaluation
      const allGrades = await this.getClassGrades(classId); // On adaptera selon l'implémentation backend
      return allGrades.filter((grade) => grade.evaluationId === evaluationId);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des notes de l'évaluation:",
        error
      );
      return [];
    }
  }
}
