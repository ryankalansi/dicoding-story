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
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        await app.renderPage();
      });
    } else {
      await app.renderPage();
    }
  });

  const skipLink = document.querySelector(".skip-to-content");
  const mainContent = document.querySelector("#main-content");

  if (skipLink && mainContent) {
    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();
      mainContent.focus();
      mainContent.scrollIntoView();
    });
  }
});
