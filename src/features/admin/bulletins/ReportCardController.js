export class ReportCardController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("reportCards");
    this.cache = {
      reportCards: null,
      lastUpdated: null,
    };
  }

  async loadReportCards(forceRefresh = false, filters = {}) {
    try {
      if (!forceRefresh && this.cache.reportCards && this.isCacheValid()) {
        return this.cache.reportCards;
      }

      const reportCards = await this.service.getAllReportCards(filters);
      this.cache.reportCards = reportCards;
      this.cache.lastUpdated = Date.now();
      return reportCards;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les bulletins",
        "error"
      );
      throw error;
    }
  }

  async downloadReportCard(id) {
    try {
      console.log("Tentative de téléchargement du bulletin ID:", id);

      const response = await this.service.downloadReportCard(id);

      // Créer le blob PDF
      const blob =
        response instanceof Blob
          ? response
          : new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Créer le lien
      const link = document.createElement("a");
      link.href = url;
      link.download = `bulletin-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}.pdf`;
      link.target = "_blank"; // <-- IMPORTANT : ouvre dans un nouvel onglet pour éviter le router
      link.style.display = "none";

      // Stopper la propagation pour que le router ne capte pas ce clic
      link.addEventListener("click", (e) => e.stopPropagation());

      document.body.appendChild(link);

      // Déclencher le téléchargement
      link.dispatchEvent(new MouseEvent("click"));

      // Nettoyage
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      this.app.services.notifications.show(
        "Téléchargement du bulletin réussi",
        "success"
      );
    } catch (error) {
      console.error("Erreur détaillée dans downloadReportCard:", error);
      this.app.services.notifications.show(
        "Erreur lors du téléchargement",
        "error"
      );
      throw error;
    }
  }

  async getTrimestres() {
    try {
      return await this.service.getTrimestres();
    } catch (error) {
      console.error("Erreur lors du chargement des trimestres:", error);
      return [];
    }
  }

  async deleteReportCard(id) {
    try {
      await this.service.deleteReportCard(id);
      this.clearCache();
      this.app.eventBus.publish("report-cards:updated");
      this.app.services.notifications.show(
        "Bulletin supprimé avec succès",
        "success"
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la suppression";
      this.app.services.notifications.show(errorMessage, "error");
      throw error;
    }
  }

  async searchStudents(searchTerm) {
    try {
      return await this.service.searchStudents(searchTerm);
    } catch (error) {
      console.error("Erreur lors de la recherche des étudiants:", error);
      return [];
    }
  }

  async generateReportCard({ studentId, trimestreId }) {
    if (!studentId || !trimestreId) {
      throw new Error("ID étudiant et ID trimestre requis");
    }

    try {
      const result = await this.service.generateReportCard({
        studentId,
        trimestreId,
      });

      this.clearCache();
      this.app.eventBus.publish("report-cards:updated");
      this.app.services.notifications.show(
        "Bulletin généré avec succès",
        "success"
      );

      return result;
    } catch (error) {
      console.error("Erreur lors de la génération du bulletin:", error);
      this.app.services.notifications.show(
        error.message || "Erreur lors de la génération du bulletin",
        "error"
      );
      throw error;
    }
  }

  clearCache() {
    this.cache.reportCards = null;
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }
}