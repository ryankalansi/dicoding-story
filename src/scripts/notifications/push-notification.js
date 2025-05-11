const PushNotification = {
  async requestPermission() {
    if (!("Notification" in window)) {
      console.log("Browser tidak mendukung notification");
      return;
    }

    const status = await Notification.requestPermission();
    if (status === "granted") {
      console.log("Notification permission granted.");
      this.subscribePush();
    } else {
      console.log("Notification permission denied.");
    }
  },

  async subscribePush() {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this._urlBase64ToUint8Array(
        "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"
      ),
    });

    console.log("Push subscription:", JSON.stringify(subscription));
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
