import { AbstractService } from "@/app/abstract/AbstractService";

export class AverageService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getClassAverages(classId, filters = {}) {
    const response = await this.get(`/api/averages/class/${classId}`, filters);
    return response.data;
  }

  async getStudentAverages(studentId, filters = {}) {
    const response = await this.get(
      `/api/averages/student/${studentId}`,
      filters
    );
    return response.data;
  }

  async createOrUpdateAverage(data) {
    const response = await this.post("/api/averages", data);
    return response.data;
  }

  async calculateClassAverages(classId, data) {
    const response = await this.post(
      `/api/averages/calculate/${classId}`,
      data
    );
    return response.data;
  }

  async calculateUpdatedAverages(classId, data) {
    const response = await this.post(
      `/api/averages/calculateUpdated/${classId}`,
      data
    );
    return response.data;
  }

  async getClassGrades(classId, filters = {}) {
    const response = await this.get(`/api/grades/class/${classId}`, filters);
    return response.data;
  }
}
