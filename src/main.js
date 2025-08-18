import "@assets/style.css"
import { App } from "@app/App.js"


const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL,
  initialState: {
    user: null,
    isAuthenticated: false,
    role: null,
  },
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

  const app = new App(config);
  window.app = app;

  console.log("Application initialisée", window.app);
});
