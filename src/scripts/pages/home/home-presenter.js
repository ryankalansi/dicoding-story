import StoriesAPI from "../../data/api";

class HomePresenter {
  constructor({ view }) {
    // Receive the view
    this.view = view;
    this.storiesAPI = StoriesAPI;
  }

  async loadStories() {
    try {
      const response = await this.storiesAPI.getStories(1, 10, 1);
      this.view.showStories(response.listStory);
    } catch (error) {
      this.view.showError(error.message);
    }
  }
}

export default HomePresenter;
