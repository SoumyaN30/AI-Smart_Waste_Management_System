import { useEffect, useRef, useState } from "react";
import axios from "axios";

function WasteCameraAI({ onPrediction, onClearPrediction, resetTrigger }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");
  const [capturedFile, setCapturedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const AI_API_URL = "http://127.0.0.1:8000/predict";

  const styles = {
    box: {
      padding: "18px",
      borderRadius: "18px",
      background: "rgba(15, 23, 42, 0.08)",
      border: "1px solid rgba(148, 163, 184, 0.35)",
      marginTop: "15px",
      marginBottom: "15px",
    },

    video: {
      width: "100%",
      maxWidth: "650px",
      height: "260px",
      objectFit: "cover",
      borderRadius: "16px",
      border: "1px solid rgba(148, 163, 184, 0.5)",
      display: "block",
      marginTop: "12px",
      background: "#020617",
    },

    image: {
      width: "100%",
      maxWidth: "650px",
      height: "260px",
      objectFit: "cover",
      borderRadius: "16px",
      border: "1px solid rgba(148, 163, 184, 0.5)",
      display: "block",
      marginTop: "12px",
    },

    row: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "14px",
    },

    primaryBtn: {
      border: "none",
      borderRadius: "999px",
      padding: "11px 18px",
      background: "linear-gradient(135deg, #22c55e, #14b8a6)",
      color: "white",
      fontWeight: "800",
      cursor: "pointer",
    },

    secondaryBtn: {
      border: "none",
      borderRadius: "999px",
      padding: "11px 18px",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "white",
      fontWeight: "800",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
    },

    dangerBtn: {
      border: "none",
      borderRadius: "999px",
      padding: "11px 18px",
      background: "linear-gradient(135deg, #ef4444, #f97316)",
      color: "white",
      fontWeight: "800",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.7 : 1,
    },

    resultBox: {
      marginTop: "14px",
      padding: "14px",
      borderRadius: "14px",
      background: "rgba(34, 197, 94, 0.12)",
      border: "1px solid rgba(34, 197, 94, 0.35)",
    },

    warningBox: {
      marginTop: "14px",
      padding: "14px",
      borderRadius: "14px",
      background: "rgba(249, 115, 22, 0.12)",
      border: "1px solid rgba(249, 115, 22, 0.35)",
    },
  };

  const stopCamera = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraOn(false);
  };

  const clearCameraData = () => {
    stopCamera();
    setCapturedImage("");
    setCapturedFile(null);
    setPrediction(null);
    setLoading(false);
  };

  const startCamera = async () => {
    try {
      clearCameraData();

      if (onClearPrediction) {
        onClearPrediction();
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera is not supported in this browser");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera permission denied or camera not available");
    }
  };

  useEffect(() => {
    if (cameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;

      videoRef.current
        .play()
        .catch((err) => console.log("Video play error:", err));
    }
  }, [cameraOn]);

  useEffect(() => {
    clearCameraData();
  }, [resetTrigger]);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      alert("Camera not ready");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      alert("Camera preview is not ready. Please wait 1 second and try again.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(imageDataUrl);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert("Failed to capture image");
          return;
        }

        const file = new File([blob], `waste-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setCapturedFile(file);
      },
      "image/jpeg",
      0.92
    );

    stopCamera();
  };

  const recaptureImage = () => {
    clearCameraData();

    if (onClearPrediction) {
      onClearPrediction();
    }

    startCamera();
  };

  const predictWaste = async () => {
    try {
      if (!capturedFile) {
        alert("Please capture image first");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("image", capturedFile);

      const res = await axios.post(AI_API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;

      if (data.error) {
        alert(data.error);
        return;
      }

      const finalPrediction = {
        wasteType: data.wasteType || "",
        modelLabel: data.wasteType || "",
        confidence: data.confidence || 0,
        message: data.message || "",
        imageFile: capturedFile,
      };

      setPrediction(finalPrediction);

      if (onPrediction) {
        onPrediction(finalPrediction);
      }
    } catch (err) {
      console.error("AI prediction error:", err);
      alert("AI prediction failed. Check Flask API is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={styles.box}>
      <h3>🤖 AI Waste Classification Using Camera</h3>

      <p>
        Capture waste image and predict whether it is Dry Waste, Wet Waste or
        Hazardous Waste.
      </p>

      {!cameraOn && !capturedImage && (
        <button type="button" style={styles.primaryBtn} onClick={startCamera}>
          Open Camera
        </button>
      )}

      {cameraOn && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={styles.video}
          />

          <div style={styles.row}>
            <button
              type="button"
              style={styles.primaryBtn}
              onClick={captureImage}
            >
              Capture Image
            </button>

            <button type="button" style={styles.dangerBtn} onClick={stopCamera}>
              Close Camera
            </button>
          </div>
        </>
      )}

      {capturedImage && (
        <>
          <img src={capturedImage} alt="Captured waste" style={styles.image} />

          <div style={styles.row}>
            <button
              type="button"
              style={styles.secondaryBtn}
              onClick={predictWaste}
              disabled={loading}
            >
              {loading ? "Predicting..." : "Predict Waste Type"}
            </button>

            <button
              type="button"
              style={styles.dangerBtn}
              onClick={recaptureImage}
              disabled={loading}
            >
              Recapture
            </button>
          </div>
        </>
      )}

      {prediction && prediction.confidence >= 75 && (
        <div style={styles.resultBox}>
          <h3>Prediction Successful</h3>

          <p>
            <strong>Waste Category:</strong> {prediction.wasteType}
          </p>

          <p>
            <strong>Confidence:</strong> {prediction.confidence}%
          </p>
        </div>
      )}

      {prediction && prediction.confidence < 75 && (
        <div style={styles.warningBox}>
          <h3>Prediction Uncertain</h3>

          <p>
            <strong>Predicted:</strong> {prediction.wasteType}
          </p>

          <p>
            <strong>Confidence:</strong> {prediction.confidence}%
          </p>

          <p>Please recapture the image clearly.</p>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default WasteCameraAI;