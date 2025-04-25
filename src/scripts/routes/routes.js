import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import DetailPage from "../pages/detail/detail-page";
import AddStoryPage from "../pages/add/add-story-page";
import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/detail/:id": new DetailPage(),
  "/add": new AddStoryPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
};

export default routes;
