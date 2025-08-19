export class GlobalAverage {
  constructor(data) {
    this.average = data?.moyenne_generale_globale || 0;
    this.previousAverage = null;
  }

  render() {
    const container = document.createElement("div");
    container.className = "card bg-base-100 shadow-md";

    container.innerHTML = `
      <div class="card-body">
        <h3 class="card-title text-lg">Moyenne générale</h3>
        <div class="flex items-end gap-4">
          <span class="text-5xl font-bold ${this.getTextColor()}">
            ${this.average.toFixed(2)}
          </span>
          ${this.renderTrendIndicator()}
        </div>
        ${this.renderRadialProgress()}
        <div class="flex justify-between text-sm mt-2">
          <span>0</span>
          <span>10</span>
          <span>20</span>
        </div>
      </div>
    `;

    return container;
  }

  getTextColor() {
    if (this.average >= 12) return "text-success";
    if (this.average >= 10) return "text-primary";
    return "text-error";
  }

  renderTrendIndicator() {
    if (!this.previousAverage) return "";
    const trend = this.average >= this.previousAverage ? "up" : "down";
    const diff = Math.abs(this.average - this.previousAverage).toFixed(2);

    return `
      <div class="flex items-center ${
        trend === "up" ? "text-success" : "text-error"
      }">
        ${trend === "up" ? "↑" : "↓"} ${diff}
      </div>
    `;
  }

  renderRadialProgress() {
    const percentage = (this.average / 20) * 100;

    return `
      <div class="radial-progress ${this.getProgressColor()}" 
           style="--value:${percentage}; --size:8rem; --thickness: 8px;">
        <span class="text-xl font-bold">${Math.round(percentage)}%</span>
      </div>
    `;
  }

  getProgressColor() {
    if (this.average >= 12) return "text-success";
    if (this.average >= 10) return "text-primary";
    return "text-error";
  }

  mount(parent) {
    parent.appendChild(this.render());
  }
}
