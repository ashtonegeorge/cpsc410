def rank_topics(clusters, keywords):
    """Ranks topics based on response count in each cluster."""
    ranked_topics = sorted(clusters.items(), key=lambda x: len(x[1]), reverse=True)
    
    return [
        {
            "topic": f"Topic {cluster_id}",
            "summary": generate_description_template(keywords.get(cluster_id, [])),
            "keywords": keywords.get(cluster_id, []),
            "count": len(responses),
            "responses": responses[:3]  # Show first 3 responses as a sample
        }
        for cluster_id, responses in ranked_topics
    ]

def generate_description_template(keywords):
    return f"This topic focuses on '{keywords[0]}', with mentions of {keywords[1]}, {keywords[2]}, and {keywords[3]}"
