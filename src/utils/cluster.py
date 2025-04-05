import hdbscan
import numpy as np

def cluster_embeddings(embeddings):
    clusterer = hdbscan.HDBSCAN(min_cluster_size=2, metric='euclidean', cluster_selection_method='eom')
    labels = clusterer.fit_predict(embeddings)

    return labels
