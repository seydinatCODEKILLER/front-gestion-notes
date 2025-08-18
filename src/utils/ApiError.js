export class ApiError extends Error {
  constructor(status, { message, code, originalError, ...data }) {
    super(message || `API Error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.originalError = originalError;
    this.data = data;
    this.isApiError = true;
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message,
      code: this.code,
      ...this.data,
    };
  }
}