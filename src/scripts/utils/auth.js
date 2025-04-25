import StoriesAPI from "../data/api";

const Auth = {
  init({ loginButton, logoutButton, registerButton }) {
    this._loginButton = loginButton;
    this._logoutButton = logoutButton;
    this._registerButton = registerButton;

    this._checkLoginStatus();
    this._addEventListeners();
  },

  _checkLoginStatus() {
    const isLoggedIn = StoriesAPI.checkAuth();

    if (isLoggedIn) {
      this._showLoggedInState();
    } else {
      this._showLoggedOutState();
    }
  },

  _showLoggedInState() {
    const user = JSON.parse(localStorage.getItem("user")) || {};

    if (this._loginButton) this._loginButton.style.display = "none";
    if (this._registerButton) this._registerButton.style.display = "none";
    if (this._logoutButton) {
      this._logoutButton.style.display = "block";
      this._logoutButton.textContent = `Logout (${user.name})`;
    }
  },

  _showLoggedOutState() {
    if (this._loginButton) this._loginButton.style.display = "block";
    if (this._registerButton) this._registerButton.style.display = "block";
    if (this._logoutButton) this._logoutButton.style.display = "none";
  },

  _addEventListeners() {
    if (this._logoutButton) {
      this._logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        this._logout();
      });
    }
  },

  _logout() {
    StoriesAPI.logout();
    this._showLoggedOutState();
    // kembali ke beranda setelah logout
    window.location.hash = "#/";
  },
};

export default Auth;
