export class ErrorLayout {
  constructor(app) {
    this.app = app;
    this.container = this.#createLayoutContainer();
  }

  #createLayoutContainer() {
    const container = document.createElement("div");
    container.className =
      "error-layout min-h-screen flex items-center justify-center p-4";
    return container;
  }

  async setup() {
    document.body.appendChild(this.container);
  }

  async renderView(view) {
    const contentArea = this.container;
    contentArea.innerHTML = "";

    try {
      let content;
      if (typeof view.getContent === "function") {
        content = await view.getContent();
      } else if (view.container) {
        content = view.container;
      }

      if (content) {
        contentArea.appendChild(content);
      }
    } catch (error) {
      console.error("Failed to render error view:", error);
      contentArea.innerHTML = `
        <div class="error-fallback text-center">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">Erreur de rendu</h2>
          <p class="text-gray-600">Une erreur est survenue lors de l'affichage.</p>
        </div>
      `;
    }
  }

  async beforeDestroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  destroy() {
    this.beforeDestroy();
  }
}
