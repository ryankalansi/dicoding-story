import StoriesAPI from "../../data/api";

const RegisterPresenter = {
  async register({ name, email, password }) {
    return StoriesAPI.register({ name, email, password });
  },
};

export default RegisterPresenter;
