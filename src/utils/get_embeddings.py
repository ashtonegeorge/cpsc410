import sys
import json
import numpy as np
import onnxruntime as ort

def get_embeddings(input_texts):
    session = ort.InferenceSession("./src/models/minilm/model.onnx")

    # Tokenize input text (replace with actual tokenizer)
    max_sequence_length = 1280  # Update this based on the model's expected input shape
    input_ids = np.array([ord(c) for c in input_texts], dtype=np.int64)[:max_sequence_length]
    attention_mask = np.ones_like(input_ids, dtype=np.int64)
    token_type_ids = np.zeros_like(input_ids, dtype=np.int64)

    # Pad inputs to match the model's expected sequence length
    padding_length = max_sequence_length - len(input_ids)
    if padding_length > 0:
        input_ids = np.pad(input_ids, (0, padding_length), constant_values=0)
        attention_mask = np.pad(attention_mask, (0, padding_length), constant_values=0)
        token_type_ids = np.pad(token_type_ids, (0, padding_length), constant_values=0)

    # Prepare the input dictionary
    inputs = {
        "input_ids": input_ids.reshape(1, -1),
        "attention_mask": attention_mask.reshape(1, -1),
        "token_type_ids": token_type_ids.reshape(1, -1),
    }

    # Run the model
    result = session.run(None, inputs)
    return result

if __name__ == "__main__":
    input_text = sys.argv[1]
    embeddings = get_embeddings(input_text)
    print(json.dumps(embeddings))