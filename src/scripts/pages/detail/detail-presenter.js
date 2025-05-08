import StoriesAPI from "../../data/api";

const DetailPresenter = {
  async loadDetail({ id, onSuccess, onError }) {
    try {
      const response = await StoriesAPI.getStoryDetail(id);

      if (!response.error) {
        onSuccess(response.story);
      } else {
        onError(response.message);
      }
    } catch (err) {
      onError(err.message || "Failed to fetch story detail");
    }
  },
};

export default DetailPresenter;
