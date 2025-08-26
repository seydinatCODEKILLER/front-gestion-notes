import { AbstractService } from "@/app/abstract/AbstractService";

export class SubjectService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllSubjects() {
    const response = await this.get("matieres");
    return response.data;
  }

  async getSubject(id) {
    const response = await this.get(`matieres/${id}`);
    return response.data;
  }

  async createSubject(data) {
    const response = await this.post("matieres", data);
    return response.data;
  }

  async updateSubject(id, data) {
    const response = await this.put(`matieres/${id}`, data);
    return response.data;
  }

  async softDeleteSubject(id) {
    const response = await this.patch(`matieres/${id}/delete`);
    return response.data;
  }

  async restoreSubject(id) {
    const response = await this.patch(`matieres/${id}/restore`);
    return response.data;
  }

  async subjectExists(nom, niveauId, excludeId = null) {
    try {
      const subjects = await this.getAllSubjects();
      return subjects.some(
        (s) => 
          s.nom.toLowerCase() === nom.toLowerCase() && 
          s.niveauId == niveauId &&
          (!excludeId || s.id !== excludeId)
      );
    } catch (error) {
      console.error("Erreur lors de la vérification de la matière:", error);
      return false;
    }
  }
    async getSubjectsByTeacher(teacherId) {
    const response = await this.get(
      `teacher-subjects/teacher/${teacherId}`
    );
    return response.data;
  }
}