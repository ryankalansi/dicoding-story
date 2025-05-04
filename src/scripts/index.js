import "../styles/styles.css";
import "leaflet/dist/leaflet.css";

import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    const tryFocus = () => {
      const mainContent = document.querySelector("#main-content");
      if (mainContent) {
        mainContent.setAttribute("tabindex", "-1");
        mainContent.focus();
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        await app.renderPage();
        tryFocus();
      });
    } else {
      await app.renderPage();
      tryFocus();
    }
  });

  const skipLink = document.querySelector(".skip-to-content");
  const mainContent = document.querySelector("#main-content");

  if (skipLink && mainContent) {
    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      mainContent.setAttribute("tabindex", "-1"); //
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    skipLink.addEventListener("blur", () => {
      skipLink.setAttribute("tabindex", "-1");
    });

    if (window.location.hash === "#main-content") {
      mainContent.setAttribute("tabindex", "-1");
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});
