import json
import re
import sys
from embed import get_embeddings
from cluster import cluster_embeddings
from extract import extract_keywords_tfidf
from rank import rank_topics
from preprocessor import preprocess_sentences

def main():
    # get and preprocess the passed responses from node process
    responses = sys.stdin.read() 
    sentences = re.split('[|]', responses)
    useless = {"n/a", "na", "none", "nothing", "no", "n.a.", "n a"}
    filtered_sentences = [s for s in sentences if s.lower().strip().strip(".").strip("!") not in useless]
    cleaned = preprocess_sentences(filtered_sentences)

    embeddings = get_embeddings(cleaned) # vectorize the sentences using MiniLM
    
    # group the similar sentences together
    labels = cluster_embeddings(embeddings) 
    clusters = {i: [] for i in set(labels) if i != -1}
    for i, label in enumerate(labels):
        if label != -1:
            clusters[label].append(cleaned[i])

    keywords = extract_keywords_tfidf(clusters) # extract the key words shared amongst each cluster
    ranked_topics = rank_topics(clusters, keywords) # rank the topics and build a json object for output

    print(json.dumps(ranked_topics))  # Print JSON output


if __name__ == "__main__":
    main()