import { AbstractService } from "@/app/abstract/AbstractService.js";
import { LoginSchema,validateAuthData } from "@features/authentification/AuthSchema.js";

export class AuthService extends AbstractService {
  constructor(app) {
    super(app);
    this.tokenKey = "auth_token";
    this.userKey = "auth_user";
  }

  async login(credentials) {
    const { isValid, errors } = validateAuthData(credentials, LoginSchema);
    if (!isValid) throw this.createValidationError(errors);

    const response = await this.request("POST", "/api/auth/login", credentials);

    this.persistAuthData(response.data);
    this.eventBus.publish("auth:login", response.data.user);

    return response.data.user;
  }

  logout() {
    this.clearAuthData();
    this.eventBus.publish("auth:logout");
  }

  getCurrentUser() {
    return this.storage.get(this.userKey);
  }

  getToken() {
    return this.storage.get(this.tokenKey);
  }

  // Méthodes privées
  persistAuthData({ token, user }) {
    this.storage.set(this.tokenKey, token);
    this.storage.set(this.userKey, user);
  }

  clearAuthData() {
    this.storage.remove(this.tokenKey);
    this.storage.remove(this.userKey);
  }

  createValidationError(errors) {
    const error = new Error("Validation failed");
    error.name = "ValidationError";
    error.errors = errors;
    error.isValidationError = true;
    return error;
  }
}
