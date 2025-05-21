const PushNotification = {
  async requestPermission() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("Browser tidak mendukung notifikasi");
      return;
    }

    const status = await Notification.requestPermission();
    if (status === "granted") {
      console.log("Permission granted");
      this._updateButtons(true);
    } else {
      console.log("Permission denied");
    }
  },

  async subscribePush() {
    const reg = await navigator.serviceWorker.ready;

    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(
          "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"
        ),
      });

      console.log("Subscribed!", JSON.stringify(sub));
      this._updateButtons(true);

      // ✅ Tampilkan pesan berhasil
      alert("Selamat! Anda berhasil subscribe notifikasi.");
    } catch (err) {
      console.error("Gagal subscribe:", err);
    }
  },

  async unsubscribePush() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    if (sub) {
      await sub.unsubscribe();
      console.log("Unsubscribed from push notifications.");
      this._updateButtons(false);

      // ❌ Tampilkan pesan berhenti
      alert("Anda telah berhenti berlangganan notifikasi.");
    }
  },

  async checkSubscription() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    this._updateButtons(!!sub);
  },

  _updateButtons(isSubscribed) {
    const subscribeBtn = document.querySelector("#subscribe-push");
    const unsubscribeBtn = document.querySelector("#unsubscribe-push");

    if (subscribeBtn && unsubscribeBtn) {
      if (isSubscribed) {
        subscribeBtn.hidden = true;
        unsubscribeBtn.hidden = false;
      } else {
        subscribeBtn.hidden = false;
        unsubscribeBtn.hidden = true;
      }
    }
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  },
};

export default PushNotification;
