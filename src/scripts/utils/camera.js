const CameraUtils = {
  async init({
    videoElement,
    canvas,
    startButton,
    captureButton,
    resetButton,
  }) {
    this._video = videoElement;
    this._canvas = canvas;
    this._startButton = startButton;
    this._captureButton = captureButton;
    this._resetButton = resetButton;
    this._stream = null;
    this._photoData = null;

    this._addEventListeners();
  },

  _addEventListeners() {
    this._startButton.addEventListener("click", () => {
      this.startCamera();
    });

    this._captureButton.addEventListener("click", () => {
      this.capturePhoto();
    });

    this._resetButton.addEventListener("click", () => {
      this.resetCamera();
    });
  },

  async startCamera() {
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      this._video.srcObject = this._stream;
      this._video.style.display = "block";
      this._canvas.style.display = "none";
      this._startButton.style.display = "none";
      this._captureButton.style.display = "inline-block";
      this._resetButton.style.display = "inline-block";
    } catch (error) {
      console.error("Error starting camera:", error);
      alert(
        "Failed to access camera. Please make sure you have given permission to use the camera."
      );
    }
  },

  capturePhoto() {
    const context = this._canvas.getContext("2d");
    const width = this._video.videoWidth;
    const height = this._video.videoHeight;

    if (width && height) {
      this._canvas.width = width;
      this._canvas.height = height;
      context.drawImage(this._video, 0, 0, width, height);

      this._photoData = this._dataURItoBlob(
        this._canvas.toDataURL("image/jpeg")
      );

      this._video.style.display = "none";
      this._canvas.style.display = "block";
      this._captureButton.style.display = "none";
    }
  },

  resetCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }

    this._video.srcObject = null;
    this._photoData = null;
    this._video.style.display = "none";
    this._canvas.style.display = "none";
    this._startButton.style.display = "inline-block";
    this._captureButton.style.display = "none";
    this._resetButton.style.display = "none";
  },

  getPhotoData() {
    return this._photoData;
  },

  _dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  },

  clean() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }
  },
};

export default CameraUtils;
