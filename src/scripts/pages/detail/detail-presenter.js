import StoriesAPI from "../../data/api";

const DetailPresenter = {
  async loadDetail(id) {
    return StoriesAPI.getStoryDetail(id);
  },
};

export default DetailPresenter;
