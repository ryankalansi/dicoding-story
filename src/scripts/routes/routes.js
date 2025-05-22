import HomePage from "../pages/home/home-page";
import SavedStoriesPage from "../pages/saved/saved-stories-page";
import AboutPage from "../pages/about/about-page";
import DetailPage from "../pages/detail/detail-page";
import AddStoryPage from "../pages/add/add-story-page";
import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";
import NotFoundPage from "../pages/not-found-page";

const routes = {
  "/": new HomePage(),
  "/saved": new SavedStoriesPage(),
  "/about": new AboutPage(),
  "/detail/:id": new DetailPage(),
  "/add": new AddStoryPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "*": new NotFoundPage(),
};

export default routes;
