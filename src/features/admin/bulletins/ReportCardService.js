import { AbstractService } from "@/app/abstract/AbstractService";

export class ReportCardService extends AbstractService {
  constructor(app) {
    super(app);
  }

  async getAllReportCards(options = {}) {
    const { search = "", trimestreId = "", page = 1, pageSize = 10 } = options;

    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
    };

    if (search) params.search = search;
    if (trimestreId) params.trimestreId = trimestreId;

    const response = await this.get("report-cards", params);
    return response.data;
  }

  async generateReportCard(data) {
    const response = await this.post("report-cards", data);
    return response.data;
  }

  async downloadReportCard(id) {
    return this.request(
      "GET",
      `report-cards/download/${id}`,
      {},
      {
        headers: { Accept: "application/pdf" },
        responseType: "blob",
      }
    );
  }

  async deleteReportCard(id) {
    const response = await this.delete(`report-cards/${id}`);
    return response.data;
  }

  async getStudentReportCards(studentId) {
    const response = await this.get(`report-cards/student/${studentId}`);
    return response.data;
  }

  async getTrimestres() {
    const response = await this.get("trimestres");
    return response.data;
  }

  async searchStudents(searchTerm) {
    const response = await this.get("students", {
      search: searchTerm,
      pageSize: 10,
    });
    return response.data;
  }
}
