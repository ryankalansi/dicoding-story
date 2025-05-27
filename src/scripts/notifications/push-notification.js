import CONFIG from "../config";

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

      // Parse subscription
      const subscriptionPayload = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.getKey
            ? this._arrayBufferToBase64(sub.getKey("p256dh"))
            : null,
          auth: sub.getKey
            ? this._arrayBufferToBase64(sub.getKey("auth"))
            : null,
        },
      };

      const user = JSON.parse(localStorage.getItem("user")) || {};
      const token = user.token;

      if (
        token &&
        token !== "null" &&
        token !== "undefined" &&
        token.trim() !== ""
      ) {
        const response = await fetch(
          `${CONFIG.BASE_URL}/notifications/subscribe`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(subscriptionPayload),
          }
        );

        const responseData = await response.json();

        if (response.ok && !responseData.error) {
          console.log("Successfully subscribed to server:", responseData);
          this._updateButtons(true);
          this._showNotification(
            "Anda sudah berhasil berlangganan push notification",
            "success"
          );

          await this._showBrowserNotification(
            "Push Notification Aktif!",
            "Anda akan menerima notifikasi untuk story baru"
          );
        } else {
          console.warn(
            `Gagal subscribe ke server: ${response.status}`,
            responseData
          );
          this._showNotification(
            `Gagal subscribe: ${responseData.message || "Unknown error"}`,
            "error"
          );
        }
      } else {
        console.warn("Token tidak ditemukan. User belum login.");
        this._showNotification(
          "Silakan login terlebih dahulu untuk mengaktifkan notifikasi",
          "error"
        );
        this._updateButtons(false);
        return;
      }
    } catch (err) {
      console.error("Gagal subscribe:", err);
      this._showNotification(`Gagal subscribe: ${err.message}`, "error");
      this._updateButtons(false);
    }
  },

  async unsubscribePush() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    if (sub) {
      try {
        const user = JSON.parse(localStorage.getItem("user")) || {};
        const token = user.token;

        if (
          token &&
          token !== "null" &&
          token !== "undefined" &&
          token.trim() !== ""
        ) {
          const response = await fetch(
            `${CONFIG.BASE_URL}/notifications/subscribe`,
            {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                endpoint: sub.endpoint,
              }),
            }
          );

          if (!response.ok) {
            console.warn(`Gagal unsubscribe dari server: ${response.status}`);
          }
        }

        await sub.unsubscribe();
        console.log("Unsubscribed from push notifications.");
        this._updateButtons(false);
        this._showNotification("Anda berhenti berlangganan", "info");

        await this._showBrowserNotification(
          "Push Notification Dimatikan",
          "Anda tidak akan menerima notifikasi lagi"
        );
      } catch (err) {
        console.error("Gagal unsubscribe:", err);
        this._showNotification("Gagal berhenti berlangganan", "error");
      }
    }
  },

  async checkSubscription() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const isLoggedIn = !!user.token;

    // Tampilkan tombol hanya jika user sudah login dan browser support
    this._updateButtons(!!sub && isLoggedIn, isLoggedIn);
  },

  async sendStoryCreatedNotification(description) {
    console.log("sendStoryCreatedNotification called with:", description);
    console.log("Notification permission:", Notification.permission);

    // Buat pesan dengan description
    const shortDesc =
      description.length > 50
        ? `${description.substring(0, 50)}...`
        : description;
    const customNotificationMessage = `Story berhasil ditambahkan: ${description}`;

    try {
      await this._showBrowserNotification(
        "Story Berhasil Dibuat!",
        `Story berhasil ditambahkan: ${shortDesc}`
      );

      this._showNotification(customNotificationMessage, "success");
    } catch (error) {
      console.error("Failed to send local notification:", error);
      this._showNotification(customNotificationMessage, "success");
    }
  },

  async _showBrowserNotification(title, body) {
    if (Notification.permission !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    try {
      // Cek apakah service worker tersedia
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification(title, {
          body: body,
          icon: "/favicon-192.png",
          badge: "/favicon-192.png",
          tag: "dicoding-stories",
          requireInteraction: false,
          vibrate: [100, 50, 100],
          data: {
            url: window.location.href,
          },
        });

        console.log("Service Worker notification shown:", title);
      } else {
        // Fallback untuk browser yang tidak support service worker
        // Tapi tetap cek apakah Notification constructor tersedia
        if (typeof Notification !== "undefined" && Notification.constructor) {
          const notification = new Notification(title, {
            body: body,
            icon: "/favicon-192.png",
            badge: "/favicon-192.png",
            tag: "dicoding-stories",
            requireInteraction: false,
          });

          // Auto close setelah 5 detik
          setTimeout(() => {
            notification.close();
          }, 5000);

          // Handle click event
          notification.onclick = function () {
            window.focus();
            this.close();
          };

          console.log("Direct notification shown:", title);
        } else {
          console.log("Notification constructor not available");
        }
      }
    } catch (error) {
      console.error("Error showing browser notification:", error);
    }
  },

  _updateButtons(isSubscribed, isLoggedIn = true) {
    const subscribeBtn = document.querySelector("#subscribe-push");
    const unsubscribeBtn = document.querySelector("#unsubscribe-push");

    if (subscribeBtn && unsubscribeBtn) {
      if (!isLoggedIn) {
        // Jika belum login, sembunyikan kedua tombol
        subscribeBtn.hidden = true;
        unsubscribeBtn.hidden = true;
      } else if (isSubscribed) {
        subscribeBtn.hidden = true;
        unsubscribeBtn.hidden = false;
      } else {
        subscribeBtn.hidden = false;
        unsubscribeBtn.hidden = true;
      }
    }
  },

  _showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;

    const icon = document.createElement("img");
    icon.src = "/favicon-192.png";
    icon.alt = "Notification Icon";
    Object.assign(icon.style, {
      width: "24px",
      height: "24px",
      marginRight: "12px",
      flexShrink: "0",
    });

    const textElement = document.createElement("span");
    textElement.textContent = message;

    notification.appendChild(icon);
    notification.appendChild(textElement);

    Object.assign(notification.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      display: "flex",
      alignItems: "center",
      padding: "12px 16px",
      borderRadius: "8px",
      color: "white",
      fontWeight: "500",
      fontSize: "14px",
      zIndex: "9999",
      maxWidth: "350px",
      wordWrap: "break-word",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease-in-out",
    });

    switch (type) {
      case "success":
        notification.style.backgroundColor = "#4CAF50";
        break;
      case "error":
        notification.style.backgroundColor = "#f44336";
        break;
      case "info":
        notification.style.backgroundColor = "#2196F3";
        break;
      default:
        notification.style.backgroundColor = "#757575";
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  },

  _arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  },
};

export default PushNotification;
