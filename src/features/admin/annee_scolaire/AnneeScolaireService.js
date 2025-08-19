import { AbstractService } from "@/app/abstract/AbstractService";

export class AnneeScolaireService extends AbstractService {
  constructor(app) {
    super(app);
    this.cacheDuration = 300000; // 5 minutes de cache
    this.currentAnneeCache = null;
    this.lastFetch = null;
  }

  async getCurrent() {
    if (this.shouldUseCache()) {
      return this.currentTrimestreCache;
    }

    try {
      const response = await this.request("GET", "/api/annees/active");
      this.currentAnneeCache = response.data;
      console.log(this.currentAnneeCache);

      this.lastFetch = Date.now();
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  shouldUseCache() {
    return this.lastFetch && Date.now() - this.lastFetch < this.cacheDuration;
  }
}