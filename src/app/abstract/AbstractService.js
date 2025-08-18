export class AbstractService {
  constructor(app) {
    this.app = app;
    this.api = app.getService("api");
    this.storage = app.getService("storage");
    this.eventBus = app.eventBus;
  }

  async request(method, endpoint, data = {}, options = {}) {
    try {
      return await this.api.request(endpoint, {
        method,
        data,
        ...options,
      });
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  handleApiError(error) {
    if (error.isApiError) {
      this.eventBus.publish("api:error", error);
    }
    return error;
  }
}
