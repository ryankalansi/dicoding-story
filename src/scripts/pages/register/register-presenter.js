import StoriesAPI from "../../data/api";

const RegisterPresenter = {
  async register({ name, email, password, onSuccess, onError }) {
    try {
      const response = await StoriesAPI.register({ name, email, password });

      if (!response.error) {
        onSuccess();
      } else {
        onError(response.message);
      }
    } catch (err) {
      onError(err.message || "Registration failed. Please try again.");
    }
  },
};

export default RegisterPresenter;
