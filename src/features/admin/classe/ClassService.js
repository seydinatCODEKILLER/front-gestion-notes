import { AbstractService } from "@/app/abstract/AbstractService";

export class ClassService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllClasses() {
    const response = await this.get("classes");
    return response.data;
  }

  async getClass(id) {
    const response = await this.get(`classes/${id}`);
    return response.data;
  }

  async getStats() {
    const response = await this.get("classes/stats");
    return response.data;
  }

  async getClassesByTeacher(teacherId) {
    const response = await this.get(`classes/teacher/${teacherId}`);
    return response.data;
  }

  async createClass(data) {
    const response = await this.post("classes", data);
    return response.data;
  }

  async updateClass(id, data) {
    const response = await this.put(`classes/${id}`, data);
    return response.data;
  }

  async softDeleteClass(id) {
    const response = await this.patch(`classes/${id}/delete`);
    return response.data;
  }

  async restoreClass(id) {
    const response = await this.patch(`classes/${id}/restore`);
    return response.data;
  }

  async nomExists(nom, anneeScolaireId) {
    try {
      const classes = await this.getAllClasses();
      return classes.some(
        (c) =>
          c.nom.toLowerCase() === nom.toLowerCase() &&
          c.anneeScolaireId === anneeScolaireId
      );
    } catch (error) {
      console.error("Erreur lors de la vérification du nom:", error);
      return false;
    }
  }

  async getClassesByTeacher(teacherId) {
    const response = await this.get(`classes/teacher/${teacherId}`);
    return response.data;
  }

  async getClassWithStudents(classId) {
    const response = await this.get(`classes/${classId}/student`);
    return response.data;
  }
}
