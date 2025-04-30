import StoriesAPI from "../../data/api";

const LoginPresenter = {
  async login({ email, password }) {
    return StoriesAPI.login({ email, password });
  },
};

export default LoginPresenter;
