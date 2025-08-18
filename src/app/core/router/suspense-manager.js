export class SuspenseManager {
  constructor() {
    this.loaderHtml = `
      <div class="suspense-loader" aria-live="polite" aria-busy="true">
        <div class="spinner"></div>
        <p class="loading-text">Chargement en cours...</p>
      </div>
    `;
    this.skeletonHtml = `
      <div class="suspense-skeleton" aria-hidden="true">
        <!-- Adaptez selon vos besoins -->
        <div class="skeleton-header"></div>
        <div class="skeleton-content"></div>
      </div>
    `;
  }

  // Affiche un loader plein écran
  showLoader(container = document.body) {
    if (this.currentLoader) return;

    const loader = document.createElement("div");
    loader.className = "global-loader";
    loader.innerHTML = this.loaderHtml;
    container.appendChild(loader);
    this.currentLoader = loader;
  }

  // Affiche un skeleton à la place du contenu
  showSkeleton(container) {
    if (!container) return;

    const skeleton = document.createElement("div");
    skeleton.innerHTML = this.skeletonHtml;
    container.appendChild(skeleton);
    return skeleton;
  }

  // Cache tous les indicateurs
  hideLoader() {
    if (this.currentLoader) {
      this.currentLoader.remove();
      this.currentLoader = null;
    }
  }

  // Style CSS intégré (à adapter)
  injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .global-loader {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .suspense-skeleton {
        /* Styles pour vos squelettes */
      }
    `;
    document.head.appendChild(style);
  }
}
