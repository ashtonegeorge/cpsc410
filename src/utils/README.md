# Utils Folder
This readme is a work in progress. It will be updated as the project progresses.

## Folder structure
```text
utils/
├── __pycache__/
├── analyze_responses.py
├── cluster.py
├── embed.py
├── extract.py
├── preprocessor.py
└── rank.py
```

### __pycache__/
This folder contains the bytecode-compiled versions of our python scripts, which is more efficient for the python interpreter to execute.

### analyze_responses.py
This file is the orchestrator of this application's thematic analysis capabilities. From a high level, it executes all of the other scripts defined in this directory.

### cluster.py
This file groups similar sentences together by vector similarity, returning a list of labels that look like this: [-1, 0, 0, 1, -1, 2, ...], where -1 indicates noise, and non-negative integers represent different cluster groups.

### embed.py
This file converts each response into a fixed-length numerical vector using the MiniLM Sentence Transformer model that can be found [here](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/tree/main).

### extract.py
This file examines the vectors created in the embed.py file by getting the top keywords and features from the vectors.

### preprocessor.py
This file preprocesses the responses to filter out misspellings, redudant phrases, and special characters that can't be analyzed.

### rank.py
This file ranks the themes and keywords and categorizes them as a JSON output to be retrieved through the node child process and displayed in the UI.