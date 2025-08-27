import { AbstractService } from "@/app/abstract/AbstractService";

export class GradeService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async createGrade(data) {
    const response = await this.post("grades", data);
    return response.data;
  }

  async updateGrade(id, data) {
    const response = await this.put(`grades/${id}`, data);
    return response.data;
  }

  async deleteGrade(id) {
    const response = await this.delete(`grades/${id}`);
    return response.data;
  }

  async getStudentGrades(studentId) {
    const response = await this.get(`grades/student/${studentId}`);
    return response.data;
  }

  async getClassGrades(classId) {
    const response = await this.get(`grades/class/${classId}`);
    return response.data;
  }

  async getEvaluationGrades(evaluationId) {
    try {
      const allGrades = await this.getClassGrades(classId);
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
