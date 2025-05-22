// src/scripts/pages/app.js
import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import Auth from "../utils/auth";
import CameraUtils from "../utils/camera";
import DataStore from "../db/data-store";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupAuth();
    this.#updateSavedStoriesCount(); // Update count saat app init
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupAuth() {
    const navList = document.getElementById("nav-list");

    // reset navlist
    navList.innerHTML = `
      <li><a href="#/">Beranda</a></li>
      <li><a href="#/add">Tambah Cerita</a></li>
      <li>
        <a href="#/saved" id="saved-stories-link">
          📖 Saved Stories
          <span id="saved-count" class="saved-count">0</span>
        </a>
      </li>
      <li><a href="#/about">Tentang</a></li>
    `;

    // auth button
    const authNav = document.createElement("div");
    authNav.className = "auth-nav";

    const loginButton = document.createElement("a");
    loginButton.href = "#/login";
    loginButton.textContent = "Login";
    loginButton.id = "login-button";
    loginButton.className = "auth-button";

    const registerButton = document.createElement("a");
    registerButton.href = "#/register";
    registerButton.textContent = "Register";
    registerButton.id = "register-button";
    registerButton.className = "auth-button";

    const logoutButton = document.createElement("a");
    logoutButton.href = "#";
    logoutButton.textContent = "Logout";
    logoutButton.id = "logout-button";
    logoutButton.className = "auth-button";

    authNav.appendChild(loginButton);
    authNav.appendChild(registerButton);
    authNav.appendChild(logoutButton);

    const authLi = document.createElement("li");
    authLi.appendChild(authNav);
    navList.appendChild(authLi);

    Auth.init({
      loginButton,
      logoutButton,
      registerButton,
    });
  }

  // Method untuk update count saved stories
  async #updateSavedStoriesCount() {
    try {
      const savedStories = await DataStore.getSavedStories();
      const count = savedStories.length;
      const countElement = document.getElementById("saved-count");

      if (countElement) {
        countElement.textContent = count;
        countElement.style.display = count > 0 ? "inline" : "none";
      }
    } catch (error) {
      console.error("Error updating saved stories count:", error);
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML =
        '<div class="container"><h1>Page Not Found</h1><p>The page you are looking for does not exist.</p></div>';
      return;
    }

    if (document.startViewTransition) {
      const transition = document.startViewTransition(async () => {
        CameraUtils.clean?.();
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        // Update count setelah render halaman
        await this.#updateSavedStoriesCount();
      });

      await transition.finished;
    } else {
      CameraUtils.clean?.();
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      // Update count setelah render halaman
      await this.#updateSavedStoriesCount();
    }
  }
}

export default App;
