export class AbstractService {
  constructor(app) {
    if (new.target === AbstractService) {
      throw new Error("AbstractService cannot be instantiated directly");
    }
    this.app = app;
    this.api = app.getService("api");
    this.storage = app.getService("storage");
    this.eventBus = app.eventBus;
  }

  async request(method, endpoint, data = {}, options = {}) {
    try {
      const token = this.app?.getService("auth")?.getToken();
      const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let finalUrl = endpoint;

      // Gestion robuste des query params pour GET/HEAD
      if (options.params && ["GET", "HEAD"].includes(method.toUpperCase())) {
        const searchParams = new URLSearchParams();

        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });

        const queryString = searchParams.toString();
        if (queryString) {
          finalUrl += (finalUrl.includes("?") ? "&" : "?") + queryString;
        }
      }

      const requestOptions = ["GET", "HEAD"].includes(method.toUpperCase())
        ? { method, headers, ...options }
        : { method, headers, data, ...options };

      // Supprimer params pour éviter la duplication dans ApiService
      delete requestOptions.params;

      return await this.api.request(finalUrl, requestOptions);
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
