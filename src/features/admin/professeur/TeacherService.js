import { AbstractService } from "@/app/abstract/AbstractService";

export class TeacherService extends AbstractService {
  constructor(app) {
    super(app);
  }

    async getAllTeachers(options = {}) {
    const {
      includeInactive = false,
      includeSubjects = false,
    } = options;

    // Construction des paramètres de requête
    const params = {
      includeInactive: includeInactive.toString(),
      includeSubjects: includeSubjects.toString(),
    };

    const response = await this.get("teachers", params);
    return response.data;
  }

  async getTeacher(id) {
    const response = await this.get(`teachers/${id}`);
    return response.data;
  }

  async getStats() {
    const response = await this.get("teachers/stats");
    return response.data;
  }

  async createTeacher(data) {
    const response = await this.post("teachers", data, { formData: true });
    return response.data;
  }

  async updateTeacher(id, data) {
    console.log(id);
    const response = await this.put(`teachers/${id}`, data, {
      formData: true,
    });
    return response.data;
  }

  async softDeleteTeacher(id) {
    const response = await this.patch(`teachers/${id}/delete`);
    return response.data;
  }

  async restoreTeacher(id) {
    const response = await this.patch(`teachers/${id}/restore`);
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
