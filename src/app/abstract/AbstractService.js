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

    // ⚠️ Ajouter responseType ici
    const requestOptions = {
      headers,
      formData: options.formData,
      signal: options.signal,
      responseType: options.responseType, // <-- nouveau
      ...options,
    };

    let response;
    switch (method.toUpperCase()) {
      case "GET":
        response = await this.api.get(finalUrl, options.params || {}, requestOptions);
        break;
      case "POST":
        response = await this.api.post(finalUrl, data, requestOptions);
        break;
      case "PUT":
        response = await this.api.put(finalUrl, data, requestOptions);
        break;
      case "PATCH":
        response = await this.api.patch(finalUrl, data, requestOptions);
        break;
      case "DELETE":
        response = await this.api.delete(finalUrl, requestOptions);
        break;
      default:
        throw new Error(`Méthode HTTP non supportée: ${method}`);
    }

    return response;
  } catch (error) {
    this.handleApiError(error);
    throw error;
  }
}


  // Méthodes utilitaires pour un usage plus simple
  async get(endpoint, params = {}, options = {}) {
    return this.request("GET", endpoint, {}, { ...options, params });
  }

  async post(endpoint, data = {}, options = {}) {
    return this.request("POST", endpoint, data, options);
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request("PUT", endpoint, data, options);
  }

  async patch(endpoint, data = {}, options = {}) {
    return this.request("PATCH", endpoint, data, options);
  }

  async delete(endpoint, options = {}) {
    return this.request("DELETE", endpoint, {}, options);
  }

  handleApiError(error) {
    if (error.isApiError) {
      this.eventBus.publish("api:error", error);
    }
    return error;
  }
}