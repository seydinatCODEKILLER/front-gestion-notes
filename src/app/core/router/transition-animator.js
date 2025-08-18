export class TransitionAnimator {
  constructor() {
    this.duration = 300;
    this.animationClasses = {
      enter: "route-enter",
      enterActive: "route-enter-active",
      leave: "route-leave",
      leaveActive: "route-leave-active",
    };
  }

  async startTransition() {
    document.documentElement.style.pointerEvents = "none";
  }

  async animateViewTransition(oldView, newView) {
    if (!oldView || !newView) return;

    return new Promise((resolve) => {
      oldView.classList.add(this.animationClasses.leave);
      newView.classList.add(this.animationClasses.enter);

      setTimeout(() => {
        oldView.classList.add(this.animationClasses.leaveActive);
        newView.classList.add(this.animationClasses.enterActive);
      }, 20);

      setTimeout(() => {
        oldView.classList.remove(
          this.animationClasses.leave,
          this.animationClasses.leaveActive
        );
        newView.classList.remove(
          this.animationClasses.enter,
          this.animationClasses.enterActive
        );
        resolve();
      }, this.duration);
    });
  }

  async endTransition() {
    document.documentElement.style.pointerEvents = "";
  }

  injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .route-enter { opacity: 0; transform: translateY(20px); }
      .route-enter-active { transition: all 0.3s ease-out; }
      .route-leave { opacity: 1; transform: translateY(0); }
      .route-leave-active { 
        transition: all 0.3s ease-in; 
        opacity: 0;
        transform: translateY(-20px);
        position: absolute;
        width: 100%;
      }
    `;
    document.head.appendChild(style);
  }
}
