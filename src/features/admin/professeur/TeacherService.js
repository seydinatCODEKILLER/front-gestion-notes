import { AbstractService } from "@/app/abstract/AbstractService";

export class TeacherService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllTeachers() {
    const response = await this.get("/api/teachers");
    return response.data;
  }

  async getTeacher(id) {
    const response = await this.get(`/api/teachers/${id}`);
    return response.data;
  }

  async getStats() {
    const response = await this.get("/api/teachers/stats");
    return response.data;
  }

  async createTeacher(data) {
    const response = await this.post("/api/teachers", data, { formData: true });
    return response.data;
  }

  async updateTeacher(id, data) {
    console.log(id);
    const response = await this.put(`/api/teachers/${id}`, data, {
      formData: true,
    });
    return response.data;
  }

  async softDeleteTeacher(id) {
    const response = await this.patch(`/api/teachers/${id}/delete`);
    return response.data;
  }

  async restoreTeacher(id) {
    const response = await this.patch(`/api/teachers/${id}/restore`);
    return response.data;
  }

  async emailExists(email) {
    try {
      const teachers = await this.getAllTeachers();
      return teachers.some(
        (t) => t.user.email.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      return false;
    }
  }

  async phoneExists(phone) {
    try {
      const teachers = await this.getAllTeachers();
      return teachers.some((t) => t.user.telephone === phone);
    } catch (error) {
      console.error("Erreur lors de la vérification du téléphone:", error);
      return false;
    }
  }
}
