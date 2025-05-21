import StoriesAPI from "../../data/api";
import PushNotification from "../../notifications/push-notification";

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
        console.log("Story created successfully!");

        // Selalu kirim notifikasi lokal setelah berhasil menambahkan story
        try {
          await PushNotification.sendStoryCreatedNotification(description);
          console.log("Notification sent successfully");
        } catch (notifError) {
          console.error("Failed to send notification:", notifError);
          // Tetap anggap berhasil meskipun notifikasi gagal
        }

        onSuccess();
      }
    } catch (err) {
      console.error("Add story error:", err);
      onError("Unexpected error occurred.");
    }
  },
};

export default AddStoryPresenter;
