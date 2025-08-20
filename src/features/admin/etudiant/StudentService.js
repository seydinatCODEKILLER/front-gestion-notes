import { AbstractService } from "@/app/abstract/AbstractService";

export class StudentService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllStudents() {
    const response = await this.get("/api/students");
    return response.data;
  }

  async getStudent(id) {
    const response = await this.get(`/api/students/${id}`);
    return response.data;
  }

  async getStats() {
    const response = await this.get("/api/students/stats");
    return response.data;
  }

  async createStudent(data) {
    const response = await this.post("/api/students", data, { formData: true });
    return response.data;
  }

  async updateStudent(id, data) {
    const response = await this.put(`/api/students/${id}`, data, {
      formData: true,
    });
    return response.data;
  }

  async softDeleteStudent(id) {
    const response = await this.patch(`/api/students/${id}/delete`);
    return response.data;
  }

  async restoreStudent(id) {
    const response = await this.patch(`/api/students/${id}/restore`);
    return response.data;
  }

  async emailExists(email) {
    try {
      const students = await this.getAllStudents();
      return students.some(
        (s) => s.user.email.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      return false;
    }
  }

  async phoneExists(phone) {
    try {
      const students = await this.getAllStudents();
      return students.some((s) => s.user.telephone === phone);
    } catch (error) {
      console.error("Erreur lors de la vérification du téléphone:", error);
      return false;
    }
  }
}
