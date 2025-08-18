export class AuthController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("auth");
  }

  async login(credentials) {
    try {
      const user = await this.service.login(credentials);

      this.app.store.setState({
        user,
        isAuthenticated: true,
        role: user.role,
      });

      this.app.services.notifications.show(
        `Bienvenue, ${user.prenom || user.username}`,
        "success"
      );

    //   this.redirectAfterLogin(user.role);
      console.log(user);
    } catch (error) {
      this.handleAuthError(error);
      throw error;
    }
  }

  logout() {
    this.service.logout();
    this.app.store.setState({
      user: null,
      isAuthenticated: false,
      role: null,
    });
    this.app.router.navigateTo("/login");
  }

  clearSession() {
    this.service.logout();
    this.app.store.setState({
      user: null,
      isAuthenticated: false,
      role: null,
    });
  }

  // Méthodes privées
  redirectAfterLogin(role) {
    const routes = {
      admin: "/admin/dashboard",
      professeur: "/professeur/dashboard",
    };
    this.app.router.navigateTo(routes[role] || "/");
  }

  handleAuthError(error) {
    let message = "Erreur lors de l'authentification";

    if (error.isValidationError) {
      message = Object.values(error.errors).flat().join(", ");
    } else if (error.isApiError) {
        console.log(error)
      message = error.message || message;
    }

    this.app.services.notifications.show(message, "error");
  }
}
