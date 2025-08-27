import { AbstractService } from "@/app/abstract/AbstractService";

export class TeacherSubjectService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllAssociations() {
    const response = await this.get("teacher-subjects");
    return response.data;
  }

  async getTeacherSubjects(teacherId) {
    const response = await this.get(
      `teacher-subjects/teacher/${teacherId}`
    );
    return response.data;
  }

  async getTeacherSubjectsClasse(teacherId) {
    const response = await this.get(
      `teacher-subjects/teacherClass/${teacherId}`
    );
    return response.data;
  }

  async getAssociation(id) {
    const response = await this.get(`teacher-subjects/${id}`);
    return response.data;
  }

  async assignSubject(data) {
    const response = await this.post("teacher-subjects", data);
    return response.data;
  }

  async removeAssignment(id) {
    const response = await this.delete(`teacher-subjects/${id}`);
    return response.data;
  }

}
