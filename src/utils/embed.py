import os
import sys
import numpy as np
import onnxruntime as ort

import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer

def get_embeddings(input_texts):
    if getattr(sys, 'frozen', False):  # Check if running in a packaged app
        base_dir = os.path.dirname(sys.executable)  # Path to the executable in production
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))  # Path to the script in development

    # Navigate up one directory from `src/utils` to `src`
    base_dir = os.path.abspath(os.path.join(base_dir, ".."))

    # Construct the path to the model file
    model_path = os.path.join(base_dir, "models", "minilm", "model.onnx")    # Debugging: Print the resolved model path
    session = ort.InferenceSession(model_path)
    tokenizer = AutoTokenizer.from_pretrained("microsoft/MiniLM-L12-H384-uncased")

    # Tokenize the input texts
    tokens = tokenizer(input_texts, padding=True, truncation=True, max_length=128, return_tensors="np")
    input_ids = tokens["input_ids"]
    attention_mask = tokens["attention_mask"]
    token_type_ids = tokens["token_type_ids"]

    inputs = {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "token_type_ids": token_type_ids,
    }

    # Run the model
    result = session.run(None, inputs)

    # Initialize a list to store sentence embeddings
    sentence_embeddings = []

    # Apply mean pooling for each sentence separately
    for i in range(len(input_texts)):
        sentence_embedding = np.mean(result[0][i], axis=0)  # Mean pooling across tokens for each sentence
        # Normalize the embedding
        normalized_embedding = sentence_embedding / np.linalg.norm(sentence_embedding)
        sentence_embeddings.append(normalized_embedding)

    return sentence_embeddings
