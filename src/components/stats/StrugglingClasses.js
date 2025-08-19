export class StrugglingClasses {
  constructor(data) {
    this.classes = data?.classes_en_difficulte || [];
    this.threshold = 10; // Seuil de difficulté
  }

  render() {
    const container = document.createElement("div");
    container.className = "card bg-base-100 shadow-md";

    container.innerHTML = `
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h3 class="card-title text-lg">Classes en difficulté</h3>
          ${this.renderStatusBadge()}
        </div>
        ${this.renderContent()}
      </div>
    `;

    return container;
  }

  renderStatusBadge() {
    if (this.classes.length === 0) {
      return '<span class="badge badge-success">Tout va bien</span>';
    }
    return `<span class="badge badge-error">${this.classes.length} classe(s)</span>`;
  }

  renderContent() {
    if (this.classes.length === 0) {
      return `
        <div class="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Aucune classe en difficulté (moyenne < ${this.threshold})</span>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        ${this.classes
          .map(
            (classe) => `
          <div class="flex justify-between items-center p-3 rounded-lg ${this.getBackgroundColor(
            classe.moyenne_classe
          )}">
            <div class="flex-1">
              <h4 class="font-bold">${classe.classe}</h4>
              <div class="flex items-center gap-2 mt-1">
                <progress 
                  class="progress ${this.getProgressColor(
                    classe.moyenne_classe
                  )}" 
                  value="${classe.moyenne_classe}" 
                  max="20"
                ></progress>
                <span class="text-sm">${classe.moyenne_classe.toFixed(
                  1
                )}/20</span>
              </div>
            </div>
            ${this.renderWarningIcon(classe.moyenne_classe)}
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  getBackgroundColor(average) {
    if (average < 8) return "bg-error/10";
    if (average < 10) return "bg-warning/10";
    return "bg-info/10";
  }

  getProgressColor(average) {
    if (average < 8) return "progress-error";
    if (average < 10) return "progress-warning";
    return "progress-info";
  }

  renderWarningIcon(average) {
    if (average >= this.threshold) return "";

    return `
      <div class="tooltip" data-tip="Besoin d'attention">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    `;
  }

  mount(parent) {
    parent.appendChild(this.render());
  }
}
