import tensorflow as tf
import numpy as np
from PIL import Image
import json
import os

IMG_SIZE = 224

# Load model
model = tf.keras.models.load_model("waste_model.h5")

# Load class names
with open("class_names.json", "r") as f:
    class_names = json.load(f)

class_names = {int(k): v for k, v in class_names.items()}

print("Model loaded successfully")
print("Classes:", class_names)

image_path = input("Enter image path: ")

if not os.path.exists(image_path):
    print("Image path not found. Please check the path.")
    exit()

# Load image
image = Image.open(image_path).convert("RGB")
image = image.resize((IMG_SIZE, IMG_SIZE))

# Convert image to array
img_array = np.array(image).astype("float32")

# IMPORTANT:
# Do NOT normalize here because model already has Rescaling layer
img_array = np.expand_dims(img_array, axis=0)

# Predict
prediction = model.predict(img_array)

predicted_index = int(np.argmax(prediction[0]))
confidence = float(np.max(prediction[0]) * 100)

print("--------------------------------")
print("Predicted Waste Type:", class_names[predicted_index])
print("Confidence:", round(confidence, 2), "%")
print("--------------------------------")

print("\nAll class probabilities:")
for i, prob in enumerate(prediction[0]):
    print(class_names[i], ":", round(float(prob) * 100, 2), "%")