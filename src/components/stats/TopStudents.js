export class TopStudents {
  constructor(data) {
    this.students = data?.top5_eleves || [];
  }

  render() {
    const container = document.createElement('div');
    container.className = 'card bg-base-100 shadow-md';

    container.innerHTML = `
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h3 class="card-title text-lg">Top 5 des élèves</h3>
          <span class="badge badge-ghost">${this.students.length}/5</span>
        </div>
        ${this.renderContent()}
      </div>
    `;

    return container;
  }

  renderContent() {
    if (this.students.length === 0) {
      return `
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Aucun élève dans le top 5</span>
        </div>
      `;
    }

    return `
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Élève</th>
              <th>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            ${this.students.map((student, index) => `
              <tr class="hover">
                <td class="font-bold">${index + 1}</td>
                <td>
                  <div class="font-medium">${student.eleve}</div>
                  <div class="text-sm opacity-50">${student.classe}</div>
                </td>
                <td>
                  <span class="badge badge-lg ${this.getBadgeColor(student.moyenne)}">
                    ${student.moyenne.toFixed(2)}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  getBadgeColor(average) {
    if (average >= 15) return 'badge-success';
    if (average >= 12) return 'badge-primary';
    return 'badge-warning';
  }

  mount(parent) {
    parent.appendChild(this.render());
  }
}