import { AbstractService } from "@/app/abstract/AbstractService";

export class TrimestreService extends AbstractService {
  constructor(app) {
    super(app);
    this.cacheDuration = 300000; // 5 minutes de cache
    this.currentTrimestreCache = null;
    this.lastFetch = null;
  }

  async getCurrent() {
    if (this.shouldUseCache()) {
      return this.currentTrimestreCache;
    }

    try {
      const response = await this.request("GET", "/api/trimestres/current");
      this.currentTrimestreCache = response.data;
      console.log(this.currentTrimestreCache);

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