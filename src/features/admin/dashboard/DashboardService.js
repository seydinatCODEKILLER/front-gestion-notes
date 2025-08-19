import { AbstractService } from "@/app/abstract/AbstractService";
import { validateStatsData } from "@features/admin/dashboard/DashboardSchema.js";

export class DashboardService extends AbstractService {
  constructor(app) {
    super(app);
    this.cacheDuration = 300000; // 5 minutes de cache
    this.cache = {
      classes: null,
      professors: null,
      students: null,
      general: null,
      lastFetch: null,
    };
    this.trimestreService = app.getService("trimestres");
    this.anneeSclaireService = app.getService("annee_scolaire");
  }

  async getStats() {
    if (this.shouldUseCache()) {
      return this.cache;
    }

    try {
      if (!this.trimestreService || !this.trimestreService.getCurrent) {
        throw new Error("TrimestreService is not properly initialized");
      }
      const currentTrimestre = await this.trimestreService.getCurrent();
      const currentAnnee = await this.anneeSclaireService.getCurrent();
      console.log(currentTrimestre.id);

      const [classes, professors, students, general] = await Promise.all([
        this.fetchClassStats(),
        this.fetchProfessorStats(),
        this.fetchStudentStats(),
        this.fetchAdminDashboardStats(currentTrimestre.id, currentAnnee.id),
      ]);

      this.cache = {
        classes,
        professors,
        students,
        general,
        lastFetch: Date.now(),
      };

      console.log(this.cache);

      return this.cache;
    } catch (error) {
      throw error;
    }
  }

  async fetchClassStats() {
    const response = await this.request("GET", "/api/classes/stats");
    return this.validateStats(response.data);
  }

  async fetchProfessorStats() {
    const response = await this.request("GET", "/api/teachers/stats");
    return this.validateStats(response.data);
  }

  async fetchStudentStats() {
    const response = await this.request("GET", "/api/students/stats");
    return this.validateStats(response.data);
  }

  async fetchAdminDashboardStats(trimestreId, anneeScolaireId) {
    const response = await this.request(
      "GET",
      "/api/statistic/global",
      {},
      {
        params: { trimestreId: trimestreId, anneeScolaireId: anneeScolaireId },
      }
    );
    return response.data;
  }

  validateStats(data) {
    const { isValid, errors } = validateStatsData(data);
    if (!isValid) {
      throw new Error(`Invalid stats data: ${JSON.stringify(errors)}`);
    }
    return data;
  }

  shouldUseCache() {
    return (
      this.cache.lastFetch &&
      Date.now() - this.cache.lastFetch < this.cacheDuration
    );
  }
}