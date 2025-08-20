export class StudentCard {
  constructor(config) {
    this.config = {
      data: [],
      itemsPerPage: 8,
      containerId: "student-cards",
      actions: null,
      onAction: null,
      emptyMessage: "Aucun élève disponible",
      ...config,
    };

    this.currentPage = 1;
    this.init();
  }

  init() {
    this.createContainer();
    this.renderCards();
    this.setupEvents();
  }

  createContainer() {
    this.container = document.createElement("div");
    this.container.className = "p-4";
    this.container.id = `${this.config.containerId}-container`;

    this.grid = document.createElement("div");
    this.grid.className =
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
    this.grid.id = this.config.containerId;

    this.createPagination();

    this.container.appendChild(this.grid);
    this.container.appendChild(this.pagination);
  }

  createPagination() {
    this.pagination = document.createElement("div");
    this.pagination.className = "flex justify-between items-center p-4 mt-6";
    this.pagination.id = `${this.config.containerId}-pagination`;

    this.paginationInfo = document.createElement("div");
    this.paginationInfo.className = "text-sm text-base-content";
    this.paginationInfo.id = `${this.config.containerId}-pagination-info`;

    this.paginationControls = document.createElement("div");
    this.paginationControls.className = "join";

    this.prevBtn = document.createElement("button");
    this.prevBtn.className = "join-item btn btn-sm";
    this.prevBtn.innerHTML = "&larr; Précédent";
    this.prevBtn.id = `${this.config.containerId}-prev`;
    this.prevBtn.disabled = true;

    this.nextBtn = document.createElement("button");
    this.nextBtn.className = "join-item btn btn-sm";
    this.nextBtn.innerHTML = "Suivant &rarr;";
    this.nextBtn.id = `${this.config.containerId}-next`;
    this.nextBtn.disabled = this.config.data.length <= this.config.itemsPerPage;

    this.paginationControls.appendChild(this.prevBtn);
    this.paginationControls.appendChild(this.nextBtn);
    this.pagination.appendChild(this.paginationInfo);
    this.pagination.appendChild(this.paginationControls);
  }

  renderCards() {
    this.grid.innerHTML = "";

    const startIndex = (this.currentPage - 1) * this.config.itemsPerPage;
    const endIndex = startIndex + this.config.itemsPerPage;
    const itemsToShow = this.config.data.slice(startIndex, endIndex);

    if (itemsToShow.length === 0) {
      this.showEmptyMessage();
      return;
    }

    itemsToShow.forEach((student) => {
      this.grid.appendChild(this.createStudentCard(student));
    });

    this.updatePagination();
  }

  createStudentCard(student) {
    const card = document.createElement("div");
    card.className =
      "card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col";
    card.dataset.id = student.id;

    const user = student.user || {};

    const cardBody = document.createElement("div");
    cardBody.className = "p-6 flex-grow flex flex-col";

    // Avatar and name
    const header = document.createElement("div");
    header.className = "flex items-center mb-4";
    header.innerHTML = `
      <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3 overflow-hidden">
        ${
          user.avatar
            ? `<img src="${user.avatar}" class="w-full h-full object-cover" alt="${user.prenom} ${user.nom}">`
            : `<i class="ri-user-line text-green-600 text-xl"></i>`
        }
      </div>
      <div>
        <h3 class="text-lg font-semibold">${user.prenom} ${user.nom}</h3>
        <p class="text-sm text-gray-500">${
          student.class?.nom || "Non affecté"
        }</p>
      </div>
    `;

    // Student info
    const info = document.createElement("div");
    info.className = "space-y-2 mb-4 text-sm";

    let infoHTML = `
      <div class="flex items-center text-gray-600">
        <i class="ri-mail-line mr-2"></i>
        <span class="truncate">${user.email}</span>
      </div>
      <div class="flex items-center text-gray-600">
        <i class="ri-phone-line mr-2"></i>
        <span>${user.telephone}</span>
      </div>
    `;

    // if (student.date_naissance) {
    //   const age = this.calculateAge(student.date_naissance);
    //   infoHTML += `
    //     <div class="flex items-center text-gray-600">
    //       <i class="ri-calendar-event-line mr-2"></i>
    //       <span>${age} ans</span>
    //     </div>
    //   `;
    // }

    if (student.nom_parent) {
      infoHTML += `
        <div class="flex items-center text-gray-600">
          <i class="ri-parent-line mr-2"></i>
          <span>${student.nom_parent}</span>
        </div>
      `;
    }

    info.innerHTML = infoHTML;

    // Status badge
    const status = document.createElement("div");
    status.className = `badge badge-${
      user.statut === "actif" ? "success" : "warning"
    } badge-sm self-start mb-4`;
    status.textContent = user.statut === "actif" ? "Actif" : "Inactif";

    // Actions
    const cardActions = document.createElement("div");
    cardActions.className =
      "flex justify-end items-center pt-4 border-t border-base-200 mt-auto";

    if (this.config.actions) {
      cardActions.appendChild(this.renderActions(student));
    }

    // Assemble card body
    cardBody.appendChild(header);
    cardBody.appendChild(info);
    cardBody.appendChild(status);
    cardBody.appendChild(cardActions);

    // Assemble card
    card.appendChild(cardBody);

    return card;
  }

  calculateAge(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  renderActions(item) {
    const actionsContainer = document.createElement("div");
    actionsContainer.className = "flex gap-2";

    this.config.actions.items
      .filter((action) => !action.visible || action.visible(item))
      .forEach((action) => {
        const button = document.createElement("button");
        button.className = `btn btn-sm ${
          typeof action.className === "function"
            ? action.className(item)
            : action.className || "btn-outline"
        }`;

        button.innerHTML = `
          <i class="${
            typeof action.icon === "function" ? action.icon(item) : action.icon
          }"></i>
          ${
            action.label
              ? `
            <span class="hidden sm:inline">
              ${
                typeof action.label === "function"
                  ? action.label(item)
                  : action.label
              }
            </span>
          `
              : ""
          }
        `;

        button.onclick = (e) => {
          e.stopPropagation();
          const actionType =
            typeof action.action === "function" ? action.action(item) : null;
          this.config.onAction(action.name, item.id, actionType);
        };

        actionsContainer.appendChild(button);
      });

    return actionsContainer;
  }

  showEmptyMessage() {
    const emptyMessage = document.createElement("div");
    emptyMessage.className =
      "col-span-full text-center p-8 text-base-content/50";
    emptyMessage.innerHTML = `
      <i class="ri-user-line text-4xl mb-2"></i>
      <p>${this.config.emptyMessage}</p>
    `;
    this.grid.appendChild(emptyMessage);
  }

  updatePagination() {
    const totalPages = Math.ceil(
      this.config.data.length / this.config.itemsPerPage
    );

    this.prevBtn.disabled = this.currentPage === 1;
    this.nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    this.paginationInfo.textContent = `Page ${this.currentPage} sur ${totalPages} • ${this.config.data.length} élèves`;
  }

  setupEvents() {
    this.prevBtn.addEventListener("click", () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderCards();
      }
    });

    this.nextBtn.addEventListener("click", () => {
      if (
        this.currentPage <
        Math.ceil(this.config.data.length / this.config.itemsPerPage)
      ) {
        this.currentPage++;
        this.renderCards();
      }
    });
  }

  updateData(newData) {
    this.config.data = newData;
    this.currentPage = 1;
    this.renderCards();
  }

  render() {
    return this.container;
  }

  cleanup() {
    // Cleanup si nécessaire
  }
}
