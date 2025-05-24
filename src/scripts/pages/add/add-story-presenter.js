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

        // Debug: cek apakah PushNotification dan method-nya ada
        console.log("PushNotification object:", PushNotification);
        console.log(
          "sendStoryCreatedNotification method:",
          PushNotification.sendStoryCreatedNotification
        );

        // Selalu kirim notifikasi lokal setelah berhasil menambahkan story
        try {
          if (
            typeof PushNotification.sendStoryCreatedNotification === "function"
          ) {
            console.log(
              "Calling sendStoryCreatedNotification with description:",
              description
            );
            await PushNotification.sendStoryCreatedNotification(description);
            console.log("Notification sent successfully");
          } else {
            console.error("sendStoryCreatedNotification is not a function!");
            // Fallback langsung ke custom notification dengan description
            PushNotification._showNotification(
              `Story berhasil ditambahkan: ${description}`,
              "success"
            );
          }
        } catch (notifError) {
          console.error("Failed to send notification:", notifError);
          // Fallback ke custom notification dengan description
          try {
            PushNotification._showNotification(
              `Story berhasil ditambahkan: ${description}`,
              "success"
            );
          } catch (fallbackError) {
            console.error("Even fallback notification failed:", fallbackError);
          }
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
