import { ApiError } from "@/utils/ApiError.js";

export default class ApiService {
  constructor(baseURL, config = {}) {
    if (!baseURL) {
      throw new Error("ApiService requires a valid baseURL. Got: " + baseURL);
    }
    this.baseURL = baseURL;
    this.defaultHeaders = {
      Accept: "application/json",
      ...config.headers,
    };
    this.timeout = config.timeout || 20000;
    this.hooks = {
      preRequest: config.preRequest || ((req) => req),
      postResponse: config.postResponse || ((res) => res),
      onError:
        config.onError ||
        ((err) => {
          throw err;
        }),
    };
  }

  async request(
    endpoint,
    { method = "GET", data = null, formData = false, signal, headers = {} } = {}
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    const finalSignal = signal || controller.signal;

    try {
      const url = new URL(endpoint, this.baseURL);
      const options = {
        method,
        headers: { ...this.defaultHeaders, ...headers }, // Conserve les headers existants
        signal: finalSignal,
      };

      // Pre-request hook modifié pour conserver les headers
      const processedRequest = await this.hooks.preRequest({
        url,
        options,
        data,
        formData,
        headers: options.headers, // Passe les headers au hook
      });

      if (processedRequest.data) {
        if (processedRequest.formData) {
          if (processedRequest.data instanceof FormData) {
            // Déjà un FormData, on le passe direct
            processedRequest.options.body = processedRequest.data;
          } else {
            // Sinon on le construit
            processedRequest.options.body = this.#createFormData(
              processedRequest.data
            );
          }
          delete processedRequest.options.headers["Content-Type"];
        } else {
          processedRequest.options.headers["Content-Type"] = "application/json";
          processedRequest.options.body = JSON.stringify(processedRequest.data);
        }
      }


      const response = await fetch(
        processedRequest.url.toString(),
        processedRequest.options
      );
      clearTimeout(timeoutId);

      if (response.status === 401) {
        const authService = this.app?.getService("auth");
        if (authService) authService.logout();
      }

      if (!response.ok) {
        throw new ApiError(response.status, await this.#parseError(response));
      }

      return await this.#parseResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      const normalizedError = this.#normalizeError(error);
      return this.hooks.onError(normalizedError);
    }
  }

  async get(endpoint, params = {}, config = {}) {
    const url = new URL(endpoint, this.baseURL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.append(key, value);
    });
    return this.request(url.toString(), {
      ...config,
      method: "GET",
      signal: config.signal,
    });
  }

  async post(endpoint, data, { formData = false, ...config } = {}) {
    return this.request(endpoint, {
      method: "POST",
      data,
      formData,
      ...config,
    });
  }

  async patch(endpoint, data, { formData = false, ...config } = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      data,
      formData,
      ...config,
    });
  }

  async put(endpoint, data, { formData = false, ...config } = {}) {
    return this.request(endpoint, {
      method: "PUT",
      data,
      formData,
      ...config,
    });
  }

  async delete(endpoint, config = {}) {
    return this.request(endpoint, {
      method: "DELETE",
      ...config,
    });
  }

  // Méthodes utilitaires privées
  #createFormData(data) {
    const formData = new FormData();
    const appendFormData = (key, value) => {
      if (value === undefined) return;

      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item));
      } else if (typeof value === "object") {
        // Option 1: JSON.stringify (commenté par défaut)
        // formData.append(key, JSON.stringify(value));

        // Option 2: Flatten object (recommandé pour la plupart des APIs)
        Object.entries(value).forEach(([subKey, subValue]) => {
          appendFormData(`${key}[${subKey}]`, subValue);
        });
      } else {
        formData.append(key, value);
      }
    };

    Object.entries(data).forEach(([key, value]) => {
      appendFormData(key, value);
    });
    return formData;
  }

  async #parseResponse(response) {
    const contentType = response.headers.get("content-type");
    return contentType?.includes("application/json")
      ? response.json()
      : response.text();
  }

  async #parseError(response) {
    try {
      const data = await this.#parseResponse(response);
      console.log(data);
      return {
        message: data || `HTTP error ${response.status}`,
        ...data,
      };
    } catch {
      return { message: `HTTP error ${response.status}` };
    }
  }

  #normalizeError(error) {
    if (error.name === "AbortError") {
      return new ApiError(408, {
        message: "Request timeout",
        code: "TIMEOUT",
      });
    }

    return error instanceof ApiError
      ? error
      : new ApiError(0, {
          message: error.message,
          code: error.name || "NETWORK_ERROR",
          originalError: error,
        });
  }
}


