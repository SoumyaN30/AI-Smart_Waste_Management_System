from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json
import io

app = Flask(__name__)
CORS(app)

IMG_SIZE = 224

model = tf.keras.models.load_model("waste_model.h5")

with open("class_names.json", "r") as f:
    class_names = json.load(f)

class_names = {int(k): v for k, v in class_names.items()}


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Waste Classification API is running"
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]

        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        image = image.resize((IMG_SIZE, IMG_SIZE))

        img_array = np.array(image).astype("float32")

        # Do not normalize here because model already has Rescaling layer
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)

        predicted_index = int(np.argmax(prediction[0]))
        confidence = float(np.max(prediction[0]) * 100)

        predicted_class = class_names[predicted_index]

        if confidence < 75:
            return jsonify({
                "wasteType": predicted_class,
                "confidence": round(confidence, 2),
                "message": "Prediction uncertain. Please recapture image."
            })

        return jsonify({
            "wasteType": predicted_class,
            "confidence": round(confidence, 2),
            "message": "Prediction successful"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)