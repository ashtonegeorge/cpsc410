import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

def extract_keywords_tfidf(clusters):
    """
    Extracts keywords for each cluster using TF-IDF.
    
    clusters: dict {cluster_id: [list of responses]}
    Returns: dict {cluster_id: [top keywords]}
    """
    vectorizer = TfidfVectorizer(stop_words="english", 
                                 max_features=1000,
                                 token_pattern=r'(?u)\b[a-zA-Z]{3,}\b'  
                                )

    keywords_per_cluster = {}

    for cluster_id, texts in clusters.items():
        if not texts:
            continue

        # Create TF-IDF matrix
        X = vectorizer.fit_transform(texts)

        # Find top words
        feature_array = np.array(vectorizer.get_feature_names_out())
        tfidf_sorting = np.argsort(X.toarray()).flatten()[::-1]  # Sort by importance

        top_keywords = feature_array[tfidf_sorting][:5]  # Get top 5 words
        keywords_per_cluster[cluster_id] = list(top_keywords)

    return keywords_per_cluster