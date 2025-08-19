export class StatsCard {
  constructor({ title, total, active, inactive, icon = null, trend = null }) {
    this.title = title;
    this.total = total;
    this.active = active;
    this.inactive = inactive;
    this.icon = icon; // Nouveau: icône optionnelle
    this.trend = trend; // Nouveau: indicateur de tendance (up/down)

    this.element = null;
  }

  render() {
    const card = document.createElement("div");
    card.className =
      "p-6 rounded-xl shadow-lg bg-white w-full flex flex-col gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1";

    // En-tête avec icône et titre
    const header = document.createElement("div");
    header.className = "flex items-center justify-between";

    const titleContainer = document.createElement("div");
    titleContainer.className = "flex items-center gap-3";

    if (this.icon) {
      const iconEl = document.createElement("div");
      iconEl.className = `w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500`;
      iconEl.innerHTML = this.icon;
      titleContainer.appendChild(iconEl);
    }

    const h3 = document.createElement("h3");
    h3.className = "text-lg font-semibold text-gray-700";
    h3.textContent = this.title;
    titleContainer.appendChild(h3);

    header.appendChild(titleContainer);

    // Indicateur de tendance si présent
    if (this.trend) {
      const trendEl = document.createElement("div");
      trendEl.className = `px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
        this.trend.direction === "up"
          ? "bg-green-50 text-green-600"
          : "bg-red-50 text-red-600"
      }`;

      const trendIcon = document.createElement("span");
      trendIcon.innerHTML = this.trend.direction === "up" ? "↑" : "↓";
      trendEl.appendChild(trendIcon);

      const trendText = document.createElement("span");
      trendText.textContent = this.trend.value;
      trendEl.appendChild(trendText);

      header.appendChild(trendEl);
    }

    card.appendChild(header);

    // Valeur totale avec mise en évidence
    const totalEl = document.createElement("div");
    totalEl.className = "mt-2";

    const totalValue = document.createElement("p");
    totalValue.className = "text-3xl font-bold text-gray-800";
    totalValue.textContent = this.total;
    totalEl.appendChild(totalValue);

    card.appendChild(totalEl);

    // Barre de progression
    const progressContainer = document.createElement("div");
    progressContainer.className = "w-full bg-gray-100 rounded-full h-2 mt-2";

    const progressBar = document.createElement("div");
    progressBar.className =
      "h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-300";
    progressBar.style.width = `${(this.active / this.total) * 100}%`;

    progressContainer.appendChild(progressBar);
    card.appendChild(progressContainer);

    // Stats détaillées
    const statsContainer = document.createElement("div");
    statsContainer.className =
      "flex justify-between mt-4 pt-4 border-t border-gray-100";

    // Actifs
    const activeContainer = document.createElement("div");
    activeContainer.className = "flex flex-col items-center";

    const activeLabel = document.createElement("span");
    activeLabel.className = "text-xs text-gray-500";
    activeLabel.textContent = "Actifs";
    activeContainer.appendChild(activeLabel);

    const activeValue = document.createElement("span");
    activeValue.className = "font-semibold text-green-600";
    activeValue.textContent = this.active;
    activeContainer.appendChild(activeValue);

    // Inactifs
    const inactiveContainer = document.createElement("div");
    inactiveContainer.className = "flex flex-col items-center";

    const inactiveLabel = document.createElement("span");
    inactiveLabel.className = "text-xs text-gray-500";
    inactiveLabel.textContent = "Inactifs";
    inactiveContainer.appendChild(inactiveLabel);

    const inactiveValue = document.createElement("span");
    inactiveValue.className = "font-semibold text-red-600";
    inactiveValue.textContent = this.inactive;
    inactiveContainer.appendChild(inactiveValue);

    // Taux d'activité (nouveau)
    const rateContainer = document.createElement("div");
    rateContainer.className = "flex flex-col items-center";

    const rateLabel = document.createElement("span");
    rateLabel.className = "text-xs text-gray-500";
    rateLabel.textContent = "Taux";
    rateContainer.appendChild(rateLabel);

    const rateValue = document.createElement("span");
    rateValue.className = "font-semibold text-blue-600";
    rateValue.textContent = `${Math.round((this.active / this.total) * 100)}%`;
    rateContainer.appendChild(rateValue);

    statsContainer.appendChild(activeContainer);
    statsContainer.appendChild(inactiveContainer);
    statsContainer.appendChild(rateContainer);

    card.appendChild(statsContainer);

    this.element = card;
    return this.element;
  }

  mount(parent) {
    if (!this.element) this.render();
    parent.appendChild(this.element);
  }
}
