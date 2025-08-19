export class Banner {
  constructor({
    title,
    subtitle = null,
    primaryText = null,
    secondaryText = null,
    icon = null,
    image = null,
    buttons = [],
    variant = "default", // 'default', 'primary', 'success', 'warning', 'danger'
    closable = false,
    timer = null, // en millisecondes
    position = "static", // 'static', 'fixed-top', 'fixed-bottom'
  }) {
    this.title = title;
    this.subtitle = subtitle;
    this.primaryText = primaryText;
    this.secondaryText = secondaryText;
    this.icon = icon;
    this.image = image;
    this.buttons = buttons;
    this.variant = variant;
    this.closable = closable;
    this.timer = timer;
    this.position = position;

    this.element = null;
    this.timeoutId = null;

    // Mappage des variants aux classes CSS
    this.variantClasses = {
      default: "bg-white border border-gray-200",
      primary: "bg-blue-50 border border-blue-100",
      success: "bg-green-50 border border-green-100",
      warning: "bg-yellow-50 border border-yellow-100",
      danger: "bg-red-50 border border-red-100",
    };

    this.textClasses = {
      default: "text-gray-800",
      primary: "text-blue-800",
      success: "text-green-800",
      warning: "text-yellow-800",
      danger: "text-red-800",
    };
  }

  render() {
    const banner = document.createElement("div");
    banner.className = `w-full rounded-lg p-6 shadow-sm transition-all duration-300 mt-3 ${
      this.variantClasses[this.variant]
    }`;

    if (this.position === "fixed-top") {
      banner.classList.add(
        "fixed",
        "top-0",
        "left-0",
        "right-0",
        "z-50",
        "rounded-none",
        "shadow-lg"
      );
    } else if (this.position === "fixed-bottom") {
      banner.classList.add(
        "fixed",
        "bottom-0",
        "left-0",
        "right-0",
        "z-50",
        "rounded-none",
        "shadow-lg"
      );
    }

    // En-tête
    const header = document.createElement("div");
    header.className = "flex items-start justify-between gap-4";

    // Contenu principal (icône + texte)
    const content = document.createElement("div");
    content.className = "flex flex-1 gap-4";

    // Icône
    if (this.icon) {
      const iconContainer = document.createElement("div");
      iconContainer.className = `flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
        this.variant !== "default" ? "bg-white" : "bg-gray-50"
      }`;
      iconContainer.innerHTML = this.icon;
      content.appendChild(iconContainer);
    }

    // Image alternative
    if (this.image && !this.icon) {
      const imgContainer = document.createElement("div");
      imgContainer.className = "flex-shrink-0 w-16 h-16";
      const img = document.createElement("img");
      img.src = this.image;
      img.className = "w-full h-full object-contain rounded";
      img.alt = "";
      imgContainer.appendChild(img);
      content.appendChild(imgContainer);
    }

    // Texte
    const textContainer = document.createElement("div");
    textContainer.className = "flex-1";

    // Titre
    const titleEl = document.createElement("h3");
    titleEl.className = `text-lg font-semibold ${
      this.textClasses[this.variant]
    }`;
    titleEl.textContent = this.title;
    textContainer.appendChild(titleEl);

    // Sous-titre
    if (this.subtitle) {
      const subtitleEl = document.createElement("p");
      subtitleEl.className = `text-sm mt-1 ${
        this.textClasses[this.variant]
      } opacity-80`;
      subtitleEl.textContent = this.subtitle;
      textContainer.appendChild(subtitleEl);
    }

    // Texte primaire
    if (this.primaryText) {
      const primaryTextEl = document.createElement("p");
      primaryTextEl.className = `mt-2 font-medium ${
        this.textClasses[this.variant]
      }`;
      primaryTextEl.textContent = this.primaryText;
      textContainer.appendChild(primaryTextEl);
    }

    // Texte secondaire
    if (this.secondaryText) {
      const secondaryTextEl = document.createElement("p");
      secondaryTextEl.className = `text-xs mt-2 ${
        this.textClasses[this.variant]
      } opacity-70`;
      secondaryTextEl.textContent = this.secondaryText;
      textContainer.appendChild(secondaryTextEl);
    }

    content.appendChild(textContainer);
    header.appendChild(content);

    // Bouton fermer
    if (this.closable) {
      const closeBtn = document.createElement("button");
      closeBtn.className =
        "flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors";
      closeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      `;
      closeBtn.addEventListener("click", () => this.close());
      header.appendChild(closeBtn);
    }

    banner.appendChild(header);

    // Boutons d'action
    if (this.buttons.length > 0) {
      const buttonsContainer = document.createElement("div");
      buttonsContainer.className = "flex gap-3 mt-4 justify-end";

      this.buttons.forEach((btnConfig) => {
        const btn = document.createElement("button");
        btn.className = `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          btnConfig.variant === "primary"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        }`;
        btn.textContent = btnConfig.text;
        btn.addEventListener("click", btnConfig.action);
        buttonsContainer.appendChild(btn);
      });

      banner.appendChild(buttonsContainer);
    }

    this.element = banner;

    // Timer pour fermeture automatique
    if (this.timer) {
      this.timeoutId = setTimeout(() => this.close(), this.timer);
    }

    return this.element;
  }

  mount(parent) {
    if (!this.element) this.render();

    if (typeof parent === "string") {
      parent = document.querySelector(parent);
    }

    parent.appendChild(this.element);

    // Animation d'entrée
    setTimeout(() => {
      this.element.classList.add("opacity-100");
      this.element.classList.remove("opacity-0");
    }, 10);
  }

  close() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (this.element) {
      // Animation de sortie
      this.element.classList.add(
        "opacity-0",
        "transition-opacity",
        "duration-300"
      );

      setTimeout(() => {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
      }, 300);
    }
  }
}
