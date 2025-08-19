export class DashboardController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("dashboard");
  }

  async loadStats() {
    try {
      const stats = await this.service.getStats();
      console.log(stats);

      this.app.store.setState({
        dashboardStats: stats,
      });

      return stats;
    } catch (error) {
      this.app.services.notifications.show(
        "Erreur lors du chargement des statistiques",
        "error"
      );
      throw error;
    }
  }

  getGeneralStats() {
    const stats = this.app.store.state.dashboardStats;
    if (!stats) return null;

    return {
      general: stats.general,
    };
  }

  getFormattedStats() {
    const stats = this.app.store.state.dashboardStats;
    if (!stats) return null;

    return {
      classes: this.formatStat(stats.classes, "Classes", "ri-building-line"),
      professors: this.formatStat(
        stats.professors,
        "Professeurs",
        "ri-user-3-line"
      ),
      students: this.formatStat(stats.students, "Élèves", "ri-group-line"),
    };
  }

  formatStat(data, title, icon) {
    return {
      title,
      total: data.total,
      active: data.active,
      inactive: data.inactive,
      icon: `<i class="${icon}"></i>`,
      trend: {
        direction: data.active > data.inactive ? "up" : "down",
        value: `${Math.round((data.active / data.total) * 100)}%`,
      },
    };
  }
}
