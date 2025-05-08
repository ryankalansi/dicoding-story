import StoriesAPI from "../../data/api";

const LoginPresenter = {
  async login({ email, password, onSuccess, onError }) {
    try {
      const response = await StoriesAPI.login({ email, password });

      if (!response.error) {
        onSuccess();
      } else {
        onError(response.message);
      }
    } catch (err) {
      onError(err.message || "Login failed. Please try again.");
    }
  },
};

export default LoginPresenter;
