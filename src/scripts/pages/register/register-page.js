import RegisterPresenter from "./register-presenter";

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        <h1 id="content">Register</h1>

        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required minlength="8">
            <small class="form-helper">Password must be at least 8 characters</small>
          </div>

          <div class="form-actions">
            <button type="submit" id="register-button" class="submit-button">Register</button>
          </div>

          <p class="auth-link">Already have an account? <a href="#/login">Login here</a></p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById("register-form");
    const registerButton = document.getElementById("register-button");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      registerButton.disabled = true;
      registerButton.textContent = "Registering...";

      RegisterPresenter.register({
        name,
        email,
        password,
        onSuccess: () => {
          alert("Registration successful! Please login with your new account.");
          window.location.hash = "#/login";
        },
        onError: (message) => {
          alert(`Registration failed: ${message}`);
        },
      }).finally(() => {
        registerButton.disabled = false;
        registerButton.textContent = "Register";
      });
    });
  }
}
