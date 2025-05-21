import CONFIG from "../config";
import StoriesAPI from "../data/api";

const ENDPOINT_SUBSCRIBE = `${CONFIG.BASE_URL}/notifications/subscribe`;
const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

const PushNotification = {
  _subscribeButton: null,
  _unsubscribeButton: null,
  _subscription: null,

  init({ subscribeButton, unsubscribeButton }) {
    this._subscribeButton = subscribeButton;
    this._unsubscribeButton = unsubscribeButton;

    if (!this._subscribeButton || !this._unsubscribeButton) {
      console.error("Subscribe or unsubscribe button not found");
      return;
    }

    this._initButtons();
    this._checkSubscriptionStatus();
  },

  async _initButtons() {
    this._subscribeButton.addEventListener("click", async () => {
      await this.requestPermission();
    });

    this._unsubscribeButton.addEventListener("click", async () => {
      await this.unsubscribePush();
    });
  },

  async _checkSubscriptionStatus() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push notifications not supported");
      this._disableButtons();
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        this._subscription = subscription;
        this._showUnsubscribeButton();
        console.log("User is already subscribed:", subscription);
      } else {
        this._showSubscribeButton();
        console.log("User is not subscribed");
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      this._showSubscribeButton();
    }
  },

  _showSubscribeButton() {
    if (this._subscribeButton && this._unsubscribeButton) {
      this._subscribeButton.style.display = "block";
      this._unsubscribeButton.style.display = "none";
    }
  },

  _showUnsubscribeButton() {
    if (this._subscribeButton && this._unsubscribeButton) {
      this._subscribeButton.style.display = "none";
      this._unsubscribeButton.style.display = "block";
    }
  },

  _disableButtons() {
    if (this._subscribeButton && this._unsubscribeButton) {
      this._subscribeButton.disabled = true;
      this._unsubscribeButton.disabled = true;
    }
  },

  async requestPermission() {
    if (!("Notification" in window)) {
      alert("Browser tidak mendukung notifikasi");
      return;
    }

    try {
      const status = await Notification.requestPermission();
      if (status === "granted") {
        console.log("Notification permission granted.");
        await this.subscribePush();
      } else {
        console.log("Notification permission denied.");
        alert(
          "Anda menolak izin notifikasi. Aktifkan notifikasi di pengaturan browser."
        );
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  },

  async subscribePush() {
    if (!("serviceWorker" in navigator)) {
      alert("Service Worker tidak didukung oleh browser ini");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      this._subscription = subscription;
      console.log("Push subscription:", JSON.stringify(subscription));

      // Simpan subscription ke API jika user login
      if (StoriesAPI.checkAuth()) {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        await this._saveSubscriptionToServer(subscription, user.token);
      }

      this._showUnsubscribeButton();
      alert("Berhasil berlangganan notifikasi!");
    } catch (error) {
      console.error("Failed to subscribe to push:", error);
      alert("Gagal berlangganan notifikasi. Silakan coba lagi.");
    }
  },

  async unsubscribePush() {
    if (!this._subscription) {
      console.log("No subscription to unsubscribe from");
      return;
    }

    try {
      // Unsubscribe dari API jika user login
      if (StoriesAPI.checkAuth()) {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        await this._deleteSubscriptionFromServer(
          this._subscription,
          user.token
        );
      }

      // Unsubscribe dari browser
      await this._subscription.unsubscribe();
      this._subscription = null;

      this._showSubscribeButton();
      alert("Berhenti berlangganan notifikasi berhasil!");
    } catch (error) {
      console.error("Error unsubscribing:", error);
      alert("Gagal berhenti berlangganan. Silakan coba lagi.");
    }
  },

  async _saveSubscriptionToServer(subscription, token) {
    try {
      const p256dh = btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("p256dh"))
        )
      );
      const auth = btoa(
        String.fromCharCode.apply(
          null,
          new Uint8Array(subscription.getKey("auth"))
        )
      );

      const response = await fetch(ENDPOINT_SUBSCRIBE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh,
            auth,
          },
        }),
      });

      const result = await response.json();
      console.log("Subscription saved to server:", result);
      return result;
    } catch (error) {
      console.error("Error saving subscription to server:", error);
      throw error;
    }
  },

  async _deleteSubscriptionFromServer(subscription, token) {
    try {
      const response = await fetch(ENDPOINT_SUBSCRIBE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      const result = await response.json();
      console.log("Subscription deleted from server:", result);
      return result;
    } catch (error) {
      console.error("Error deleting subscription from server:", error);
      throw error;
    }
  },

  // Fungsi untuk mengirim notifikasi lokal setelah menambahkan cerita
  async sendStoryCreatedNotification(description) {
    if (!("Notification" in window)) {
      console.log("Notifications not supported");
      return;
    }

    if (Notification.permission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Create notification data in the format expected by the service worker
      const notificationData = {
        title: "Story berhasil dibuat",
        options: {
          body: `Anda telah membuat story baru dengan deskripsi: ${description.substring(
            0,
            50
          )}${description.length > 50 ? "..." : ""}`,
          icon: "/favicon-192.png",
          badge: "/favicon-192.png",
          vibrate: [100, 50, 100],
        },
      };

      // For immediate notification
      await registration.showNotification(
        notificationData.title,
        notificationData.options
      );

      console.log("Local notification sent");
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
};

export default PushNotification;
