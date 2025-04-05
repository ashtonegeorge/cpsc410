from collections import defaultdict

def group_responses_by_cluster(responses, labels):
    """Groups survey responses by their HDBSCAN cluster."""
    clusters = defaultdict(list)
    
    for i, label in enumerate(labels):
        if label != -1:  # Ignore noise
            clusters[label].append(responses[i])
    
    return clusters  # { cluster_id: [response1, response2, ...] }