import StoriesAPI from "../../data/api";

const AddStoryPresenter = {
  async handleFormSubmit({ description, photo, lat, lon, onSuccess, onError }) {
    if (!description) {
      onError("Please enter a description.");
      return;
    }

    if (!photo) {
      onError("Please capture a photo.");
      return;
    }

    try {
      const response = StoriesAPI.checkAuth()
        ? await StoriesAPI.addStory({ description, photo, lat, lon })
        : await StoriesAPI.addGuestStory({ description, photo, lat, lon });

      if (response.error) {
        onError(response.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error("Add story error:", err);
      onError("Unexpected error occurred.");
    }
  },
};

export default AddStoryPresenter;
