import StoriesAPI from "../../data/api";
import Auth from "../../utils/auth";

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        <h1 id="content" tabindex="0">Login</h1>
        
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <div class="form-actions">
            <button type="submit" id="login-button" class="submit-button">Login</button>
          </div>
          
          <p class="auth-link">Don't have an account? <a href="#/register">Register here</a></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const loginButton = document.getElementById("login-button");
        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        const response = await StoriesAPI.login({
          email,
          password,
        });

        if (!response.error) {
          alert("Login successful!");

          Auth._checkLoginStatus();

          // kembali ke beranda
          window.location.hash = "#/";
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("Login failed. Please try again.");
      } finally {
        const loginButton = document.getElementById("login-button");
        loginButton.disabled = false;
        loginButton.textContent = "Login";
      }
    });
  }
}
