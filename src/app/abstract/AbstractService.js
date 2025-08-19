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

      // Utilisation des méthodes spécifiques de l'ApiService selon la méthode HTTP
      let response;
      const methodUpper = method.toUpperCase();
      
      switch (methodUpper) {
        case "GET":
          response = await this.api.get(finalUrl, options.params || {}, { 
            headers, 
            signal: options.signal,
            ...options 
          });
          break;
          
        case "POST":
          response = await this.api.post(finalUrl, data, { 
            headers, 
            formData: options.formData,
            signal: options.signal,
            ...options 
          });
          break;
          
        case "PUT":
          response = await this.api.put(finalUrl, data, { 
            headers, 
            formData: options.formData,
            signal: options.signal,
            ...options 
          });
          break;
          
        case "PATCH":
          response = await this.api.patch(finalUrl, data, { 
            headers, 
            formData: options.formData,
            signal: options.signal,
            ...options 
          });
          break;
          
        case "DELETE":
          response = await this.api.delete(finalUrl, { 
            headers, 
            signal: options.signal,
            ...options 
          });
          break;
          
        default:
          // Fallback pour les autres méthodes HTTP
          const requestOptions = ["GET", "HEAD"].includes(methodUpper)
            ? { method, headers, ...options }
            : { method, headers, data, ...options };
          
          delete requestOptions.params;
          response = await this.api.request(finalUrl, requestOptions);
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