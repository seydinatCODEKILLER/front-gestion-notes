import { AbstractView } from "@/app/abstract/AbstractView.js";
import { Banner } from "@/components/banner/Banner";
import { ReportCardCard } from "@/components/card/ReportCardCard.js";
import { FloatingActionButton } from "@/components/button/FloatingButton.js";
import { GenerateReportCardModal } from "./GenerateReportCardModal.js";
import { Modal } from "@/components/modal/Modal.js";

export class AdminReportCardView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("reportCards");
    this.reportCards = [];
    this.filters = {
      search: "",
      trimestreId: "",
    };
    this.setup();
  }

  async setup() {
    try {
      this.container.innerHTML = "";

      // Conteneur principal
      this.mainContainer = document.createElement("div");
      this.container.appendChild(this.mainContainer);

      // Banner et filtres
      this.createBanner();
      this.renderFilters();

      // Container des bulletins
      this.contentContainer = document.createElement("div");
      this.contentContainer.id = "content-container";
      this.contentContainer.className = "p-6";
      this.mainContainer.appendChild(this.contentContainer);

      // Charger les bulletins après avoir créé les containers
      await this.loadReportCards();

      // Bouton flottant
      this.initFloatingButton();
    } catch (error) {
      this.showError("Erreur de chargement des bulletins");
    }
  }

  createBanner() {
    const bannerConfig = {
      title: "Gestion des Bulletins",
      subtitle: "Générez et téléchargez les bulletins des étudiants",
      primaryText: `${this.reportCards.length} bulletin(s)`,
      secondaryText: "Gestion des résultats trimestriels",
      icon: '<i class="ri-file-list-3-line text-2xl text-blue-600"></i>',
      variant: "default",
      closable: true,
      timer: null,
    };

    this.banner = new Banner(bannerConfig);
    // Ajout au mainContainer au lieu de this.container
    this.mainContainer.appendChild(this.banner.render());
  }

  renderFilters() {
    const filtersContainer = document.createElement("div");
    filtersContainer.className = "p-6 bg-base-100 border-b";

    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-4";

    // Filtre par recherche
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Rechercher un étudiant...";
    searchInput.className = "input input-bordered";
    searchInput.value = this.filters.search;
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        this.filters.search = e.target.value;
        this.loadReportCards();
      }, 300)
    );

    // Filtre par trimestre
    const trimestreSelect = document.createElement("select");
    trimestreSelect.className = "select select-bordered";
    trimestreSelect.innerHTML = `<option value="">Tous les trimestres</option>`;
    trimestreSelect.value = this.filters.trimestreId;
    trimestreSelect.addEventListener("change", (e) => {
      this.filters.trimestreId = e.target.value;
      this.loadReportCards();
    });

    // Charger les trimestres
    this.loadTrimestres(trimestreSelect);

    grid.appendChild(searchInput);
    grid.appendChild(trimestreSelect);
    filtersContainer.appendChild(grid);

    // Ajout au mainContainer au lieu de this.container
    this.mainContainer.appendChild(filtersContainer);
  }

  async loadTrimestres(selectElement) {
    try {
      const trimestres = await this.controller.getTrimestres();
      trimestres.forEach((trimestre) => {
        const option = document.createElement("option");
        option.value = trimestre.id;
        option.textContent = `${trimestre.libelle} - ${
          trimestre.annee_scolaire?.libelle || ""
        }`;
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error("Erreur lors du chargement des trimestres:", error);
    }
  }

  async loadReportCards() {
    try {
      this.reportCards = await this.controller.loadReportCards(
        true,
        this.filters
      );
      this.renderContent();
    } catch (error) {
      console.error("Erreur lors du chargement des bulletins:", error);
    }
  }

  renderContent() {
    if (!this.contentContainer) return;

    this.contentContainer.innerHTML = "";

    if (this.reportCards.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "text-center p-8 text-gray-500";
      emptyMessage.innerHTML = `
      <i class="ri-file-list-3-line text-4xl mb-2"></i>
      <p>Aucun bulletin trouvé</p>
      ${
        this.filters.search || this.filters.trimestreId
          ? '<p class="text-sm mt-2">Essayez de modifier vos critères de recherche</p>'
          : '<p class="text-sm mt-2">Générez votre premier bulletin en cliquant sur le boutton +</p>'
      }
    `;
      this.contentContainer.appendChild(emptyMessage);
      return;
    }

    const cards = new ReportCardCard({
      data: this.reportCards,
      onAction: (action, id) => this.handleReportCardAction(action, id),
    });

    this.contentContainer.appendChild(cards.render());
  }

  initFloatingButton() {
    this.fab = new FloatingActionButton({
      icon: "ri-add-line",
      color: "primary",
      position: "bottom-right",
      size: "lg",
      onClick: () => {
        this.openGenerateModal();
      },
    });
  }

  openGenerateModal() {
    const modal = new GenerateReportCardModal(this.app, {
      onSave: async () => {
        await this.loadReportCards();
        this.app.eventBus.publish("report-cards:updated");
      },
    });
    modal.open();
  }

  // Dans handleReportCardAction
  async handleReportCardAction(action, id) {
    try {
      if (action === "download") {
        await this.controller.downloadReportCard(id);
      } else if (action === "delete") {
        const confirmed = await this.showDeleteConfirmation();
        if (confirmed) {
          await this.controller.deleteReportCard(id);
          await this.loadReportCards(); // Recharger la liste
        }
      }
    } catch (error) {
      this.handleActionError(error);
    }
  }

  async showDeleteConfirmation() {
    return new Promise((resolve) => {
      // Utiliser le modal de confirmation de votre application
      Modal.confirm({
        title: "Confirmation de suppression",
        content:
          "Êtes-vous sûr de vouloir supprimer ce bulletin ? Cette action est irréversible.",
        confirmText: "Supprimer",
        cancelText: "Annuler",
        confirmButtonClass: "btn-error",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  handleActionError(error) {
    console.error("Erreur lors de la gestion de l'action:", error);
    this.app.services.notifications.show(
      error.message || "Une erreur est survenue",
      "error"
    );
  }

  cleanup() {
    if (this.fab) this.fab.destroy();
  }
}

// Fonction debounce pour optimiser les recherches
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
