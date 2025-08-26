import { AbstractService } from "@/app/abstract/AbstractService";

export class ClassSubjectService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getClassSubjects(classId, anneeScolaireId) {
    const response = await this.get(
      `class-subjects/class/${classId}/${anneeScolaireId}`
    );
    return response.data;
  }

  async assignSubject(data) {
    const response = await this.post("class-subjects", data);
    return response.data;
  }

  async updateAssignment(id, data) {
    const response = await this.put(`class-subjects/${id}`, data);
    return response.data;
  }

  async removeAssignment(id) {
    const response = await this.delete(`class-subjects/${id}`);
    return response.data;
  }

}
