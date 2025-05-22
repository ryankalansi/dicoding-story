import "../styles/styles.css";
import "leaflet/dist/leaflet.css";
import PushNotification from "./notifications/push-notification";
import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  // Render halaman pertama kali
  await app.renderPage();

  // Navigasi hashchange (SPA)
  window.addEventListener("hashchange", async () => {
    const tryFocus = () => {
      const mainContent = document.querySelector("#main-content");
      if (mainContent) {
        mainContent.setAttribute("tabindex", "0");
        mainContent.focus();
        mainContent.setAttribute("tabindex", "-1");
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

  // Skip to content
  const skipLink = document.querySelector(".skip-to-content");
  const mainContent = document.querySelector("#main-content");

  if (skipLink && mainContent) {
    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      mainContent.setAttribute("tabindex", "0");
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      mainContent.setAttribute("tabindex", "-1");
    });

    if (window.location.hash === "#main-content") {
      mainContent.setAttribute("tabindex", "0");
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      mainContent.setAttribute("tabindex", "-1");
    }
  }

  // ===== PUSH NOTIFICATION SETUP =====
  await PushNotification.requestPermission(); // Minta izin
  await PushNotification.checkSubscription(); // Cek status awal tombol

  const subscribeBtn = document.querySelector("#subscribe-push");
  const unsubscribeBtn = document.querySelector("#unsubscribe-push");

  if (subscribeBtn && unsubscribeBtn) {
    subscribeBtn.addEventListener("click", () => {
      PushNotification.subscribePush();
    });

    unsubscribeBtn.addEventListener("click", () => {
      PushNotification.unsubscribePush();
    });
  }

  // ===== LISTEN FOR LOGIN/LOGOUT EVENTS =====
  // Jika ada event login, cek ulang subscription status
  window.addEventListener("userLoggedIn", async () => {
    await PushNotification.checkSubscription();
  });

  // Jika ada event logout, update button status
  window.addEventListener("userLoggedOut", async () => {
    await PushNotification.checkSubscription();
  });

  // Optional: Listen for storage changes (jika login/logout mengubah localStorage)
  window.addEventListener("storage", (e) => {
    if (e.key === "token") {
      PushNotification.checkSubscription();
    }
  });
});
