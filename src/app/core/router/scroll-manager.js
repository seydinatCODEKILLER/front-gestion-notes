export class ScrollManager {
  constructor() {
    this.positions = new Map();
    this.options = {
      debounceTime: 100,
    };
    this.debounceTimer = null;
  }

  // Sauvegarde la position pour une route
  saveScrollPosition(path) {
    if (typeof window === "undefined") return;

    // Debounce pour éviter trop d'appels
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.positions.set(path, {
        x: window.scrollX,
        y: window.scrollY,
        timestamp: Date.now(),
      });
    }, this.options.debounceTime);
  }

  // Restaure la position sauvegardée
  restoreScrollPosition(path) {
    const position = this.positions.get(path);
    if (position) {
      window.scrollTo(position.x, position.y);
    } else {
      window.scrollTo(0, 0);
    }
  }

  // Réinitialise le scroll pour une route
  resetScrollPosition(path) {
    this.positions.delete(path);
  }

  // Nettoie les anciennes positions
  cleanup(maxAge = 60000) {
    const now = Date.now();
    for (const [path, { timestamp }] of this.positions.entries()) {
      if (now - timestamp > maxAge) {
        this.positions.delete(path);
      }
    }
  }
}
