import { AbstractView } from "@/app/abstract/AbstractView";
import { Banner } from "@/components/banner/Banner";
import { StatsCard } from "@/components/card/StatsCard";
import { GlobalAverage } from "@/components/stats/GlobalAverage";
import { StrugglingClasses } from "@/components/stats/StrugglingClasses";
import { TopStudents } from "@/components/stats/TopStudents";


export class DashboardView extends AbstractView {
  constructor(app, { params, route } = {}) {
    super(app, { params, route });
    this.controller = app.getController("dashboard");
    this.statsCards = [];
    this.banner = null;
    this.statsContainer = null;
  }

  async render() {
    this.initContainer();
    this.createBanner();
    this.initStatsContainer();
    await this.loadStatsData();
    return this.container;
  }

  initContainer() {
    this.container = document.createElement("div");
    this.container.className = "dashboard-view p-4 space-y-6";
  }

  initStatsContainer() {
    this.statsContainer = document.createElement("div");
    this.statsContainer.id = "statsContainer";
    this.container.appendChild(this.statsContainer);
  }

  async loadStatsData() {
    try {
      this.showLoadingState();
      await this.controller.loadStats();
      this.renderStatsCards();
    } catch (error) {
      console.error("Failed to load stats:", error);
      this.showErrorState();
    } finally {
      this.hideLoadingState();
    }
  }

  createBanner() {
    const bannerConfig = {
      title: "Bienvenue sur votre tableau de bord",
      subtitle: "Consultez vos statistiques et indicateurs clés",
      primaryText: "Nouveautés disponibles cette semaine",
      secondaryText: "Mise à jour: 19 août 2025",
      icon: '<i class="ri-information-line text-2xl text-blue-600"></i>',
      variant: "default",
      closable: true,
      timer: null,
    };

    this.banner = new Banner(bannerConfig);
    this.container.insertBefore(
      this.banner.render(),
      this.container.firstChild
    );
  }

  closeBanner() {
    this.banner?.close();
  }

  renderStatsCards() {
    this.clearStatsContainer();
    const formattedStats = this.controller.getFormattedStats();
    const formattedStatsGeneral = this.controller.getGeneralStats();
    

    if (!formattedStats) return;

    this.renderDetailedStatsSection(formattedStats);
    this.renderMainStatsGrid(formattedStatsGeneral);
  }

  clearStatsContainer() {
    this.statsContainer.innerHTML = "";
  }

  renderMainStatsGrid(formattedStats) {
    const mainStatsGrid = this.createStatsGrid(
      "grid-cols-1 lg:grid-cols-3 gap-6 mt-4"
    );
    this.statsContainer.appendChild(mainStatsGrid);

    const mainStatsComponents = [
      { Component: GlobalAverage, data: formattedStats.general },
      { Component: TopStudents, data: formattedStats.general },
      { Component: StrugglingClasses, data: formattedStats.general },
    ];

    mainStatsComponents.forEach(({ Component, data }) => {
      this.renderComponent(Component, data, mainStatsGrid);
    });
  }

  renderDetailedStatsSection(formattedStats) {
    const detailedSection = this.createSection(
      "Statistiques détaillées",
      "mt-8"
    );
    const detailedGrid = this.createStatsGrid(
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
    );

    detailedSection.appendChild(detailedGrid);
    this.statsContainer.appendChild(detailedSection);

    this.renderStatsCardsGrid(formattedStats, detailedGrid);
  }

  createStatsGrid(className) {
    const grid = document.createElement("div");
    grid.className = `grid ${className}`;
    return grid;
  }

  createSection(title, className = "") {
    const section = document.createElement("div");
    section.className = className;

    const titleElement = document.createElement("h3");
    titleElement.className = "text-xl font-bold mb-4";
    titleElement.textContent = title;

    section.appendChild(titleElement);
    return section;
  }

  renderComponent(Component, data, container) {
    const component = new Component(data);
    const wrapper = document.createElement("div");
    component.mount(wrapper);
    container.appendChild(wrapper);
  }

  renderStatsCardsGrid(formattedStats, container) {
    this.statsCards = Object.values(formattedStats).map((stat) => {
      const card = new StatsCard(stat);
      card.mount(container);
      return card;
    });
  }

  showLoadingState() {
    this.statsContainer.innerHTML = `
      <div class="col-span-3 flex justify-center items-center py-12">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    `;
  }

  showErrorState() {
    this.statsContainer.innerHTML = `
      <div class="col-span-3 flex flex-col items-center justify-center py-12 text-center">
        <i class="ri-error-warning-line text-4xl text-error mb-2"></i>
        <p class="text-error font-medium mb-4">Échec du chargement des statistiques</p>
        <button id="retryButton" class="btn btn-primary btn-sm">
          Réessayer
        </button>
      </div>
    `;

    this.setupRetryButton();
  }

  setupRetryButton() {
    const retryButton = this.statsContainer.querySelector("#retryButton");
    retryButton.addEventListener("click", () => this.loadStatsData());
  }

  hideLoadingState() {
    // Optional: Add fade-out transitions here
  }
}
