import networkx as nx
import community as community_louvain

def analyze(G: nx.Graph):
    """
    Computes PageRank, Betweenness Centrality, Degree Centrality, and Louvain Communities.
    Returns a dictionary of nodes with their computed metrics.
    """
    if G.number_of_nodes() == 0:
        return {}
        
    try:
        pagerank = nx.pagerank(G, weight='weight')
    except:
        pagerank = {n: 0 for n in G.nodes()}

    try:
        betweenness = nx.betweenness_centrality(G, weight='weight')
    except:
        betweenness = {n: 0 for n in G.nodes()}

    degree = dict(G.degree())

    try:
        # Louvain community detection works best on undirected graphs
        partition = community_louvain.best_partition(G, weight='weight')
    except:
        partition = {n: 0 for n in G.nodes()}
        
    results = {}
    for node in G.nodes():
        results[node] = {
            "pagerank": pagerank.get(node, 0),
            "betweenness": betweenness.get(node, 0),
            "degree": degree.get(node, 0),
            "community": partition.get(node, 0)
        }
        
    return results
