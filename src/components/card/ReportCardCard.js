export class ReportCardCard {
  constructor(config = {}) {
    this.config = {
      data: [],
      onAction: null,
      ...config,
    };

    this.init();
  }

  init() {
    this.container = document.createElement("div");
    this.container.className = "report-card-container";
  }

  render() {
    this.container.innerHTML = this.getTemplate();
    this.renderCards();
    return this.container;
  }

  getTemplate() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="report-cards-container"></div>
    `;
  }

  renderCards() {
    const container = this.container.querySelector("#report-cards-container");
    if (!container) return;

    container.innerHTML = this.config.data
      .map((reportCard) => this.getCardTemplate(reportCard))
      .join("");

    // Attacher les événements
    this.config.data.forEach((reportCard) => {
      const card = container.querySelector(`[data-id="${reportCard.id}"]`);
      if (card) {
        this.attachCardEvents(card, reportCard);
      }
    });
  }

// Dans ReportCardCard.js - modification de getCardTemplate
getCardTemplate(reportCard) {
  const student = reportCard.student?.user;
  const classe = reportCard.student?.class;
  const trimestre = reportCard.trimestre;

  return `
    <div class="card bg-base-100 shadow-lg" data-id="${reportCard.id}">
      <div class="card-body">
        <!-- En-tête avec icône PDF -->
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <i class="ri-file-pdf-line text-blue-600 text-xl"></i>
          </div>
          <span class="badge badge-primary">${trimestre?.libelle || 'N/A'}</span>
        </div>

        <!-- Informations de l'étudiant -->
        <div class="space-y-2">
          <h3 class="card-title text-lg">${student?.prenom} ${student?.nom}</h3>
          <p class="text-sm text-gray-600">${classe?.nom || 'Classe non assignée'}</p>
          <p class="text-sm text-gray-500">${student?.email || ''}</p>
        </div>

        <!-- Résultats -->
        <div class="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div>
            <span class="text-gray-600">Moyenne:</span>
            <span class="font-semibold ml-1">${reportCard.moyenne_generale || 'N/A'}</span>
          </div>
          <div>
            <span class="text-gray-600">Rang:</span>
            <span class="font-semibold ml-1">${reportCard.rang_classe ? `#${reportCard.rang_classe}` : 'N/A'}</span>
          </div>
        </div>

        <!-- Appréciation -->
        ${reportCard.appreciation_generale ? `
          <div class="mt-3 p-2 bg-base-200 rounded">
            <p class="text-sm italic">"${reportCard.appreciation_generale}"</p>
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="card-actions justify-end mt-4 gap-2">
          <button class="btn btn-primary btn-sm" data-action="download">
            <i class="ri-download-line mr-1"></i>
            Télécharger
          </button>
          <button class="btn btn-error btn-sm" data-action="delete">
            <i class="ri-delete-bin-line mr-1"></i>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  `;
}

// Et dans attachCardEvents
attachCardEvents(card, reportCard) {
  const downloadButton = card.querySelector('[data-action="download"]');
  const deleteButton = card.querySelector('[data-action="delete"]');
  
  if (downloadButton) {
    downloadButton.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.config.onAction) {
        this.config.onAction('download', reportCard.id);
      }
    });
  }
  
  if (deleteButton) {
    deleteButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (this.config.onAction) {
        this.config.onAction('delete', reportCard.id);
      }
    });
  }
}

  update(data) {
    this.config.data = data;
    this.renderCards();
  }
}
