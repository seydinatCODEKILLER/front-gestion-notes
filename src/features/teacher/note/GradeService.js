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

  async getClassGrades(classId, filters = {}) {
    const params = { ...filters };
    const response = await this.get(`/api/grades/class/${classId}`, params);
    return response.data;
  }

  async getClassesByTeacher(teacherId) {
    const response = await this.get(`/api/classes/teacher/${teacherId}`);
    return response.data;
  }

  async getSubjectsByTeacher(teacherId) {
    const response = await this.get(`/api/teacher-subjects/teacher/${teacherId}`);
    return response.data;
  }

  async getTrimestres() {
    const response = await this.get("/api/trimestres");
    return response.data;
  }

  async getStudentsByClass(classId) {
    const response = await this.get(`/api/classes/${classId}/students`);
    return response.data;
  }

  async saveGradesBatch(gradesData) {
    const response = await this.post("/api/grades/batch", gradesData);
    return response.data;
  }
}
