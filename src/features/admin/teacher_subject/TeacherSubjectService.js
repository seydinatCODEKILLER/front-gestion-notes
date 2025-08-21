import { AbstractService } from "@/app/abstract/AbstractService";

export class TeacherSubjectService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllAssociations() {
    const response = await this.get("/api/teacher-subjects");
    return response.data;
  }

  async getTeacherSubjects(teacherId) {
    const response = await this.get(
      `/api/teacher-subjects/teacher/${teacherId}`
    );
    return response.data;
  }

  async getAssociation(id) {
    const response = await this.get(`/api/teacher-subjects/${id}`);
    return response.data;
  }

  async assignSubject(data) {
    const response = await this.post("/api/teacher-subjects", data);
    return response.data;
  }

  async removeAssignment(id) {
    const response = await this.delete(`/api/teacher-subjects/${id}`);
    return response.data;
  }

}
