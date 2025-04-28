import StoriesAPI from "../../data/api";

const HomePresenter = {
  async loadStories() {
    try {
      const response = await StoriesAPI.getStories(1, 10, 1);
      return response;
    } catch (error) {
      throw new Error("Failed to fetch stories");
    }
  },
};

export default HomePresenter;
