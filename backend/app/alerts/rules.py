import networkx as nx

def generate_alerts(case_id: str, G: nx.Graph, analytics_results: dict):
    alerts = []
    
    if G.number_of_nodes() == 0:
        return alerts

    # 1. High Betweenness Node (Broker/Unknown)
    for node, metrics in analytics_results.items():
        if metrics.get("betweenness", 0) > 0.5:
            alerts.append({
                "case_id": case_id,
                "severity": "Critical",
                "title": "High Betweenness Node Detected",
                "description": f"Node {G.nodes[node].get('name', node)} acts as a critical broker in the network.",
                "entity_id": node
            })

    # 2. Circular connection (A -> B -> C -> A)
    # Simple cycle detection of length 3 or 4
    try:
        cycles = list(nx.simple_cycles(G, length_bound=4)) if G.is_directed() else []
        # For undirected, we can just find cycles in a basis
        if not G.is_directed():
            cycles = nx.cycle_basis(G)
        
        for cycle in cycles:
            if 3 <= len(cycle) <= 4:
                # If financial or general
                alerts.append({
                    "case_id": case_id,
                    "severity": "High",
                    "title": "Suspicious Circular Pattern",
                    "description": f"Detected a circular connection involving {len(cycle)} entities.",
                    "entity_id": cycle[0]
                })
                break # Just add one alert for this to avoid spam
    except:
        pass

    # 3. Dense Subgraph (proxy for shared IMEI / Call burst)
    # Look for nodes with unusually high degree relative to the graph
    avg_degree = sum(dict(G.degree()).values()) / max(1, G.number_of_nodes())
    for node, deg in G.degree():
        if deg > avg_degree * 3 and deg > 5:
            node_type = G.nodes[node].get("type", "")
            alerts.append({
                "case_id": case_id,
                "severity": "Medium",
                "title": f"Highly Active {node_type}",
                "description": f"Entity {G.nodes[node].get('name', node)} has unusually high connections ({deg}).",
                "entity_id": node
            })

    return alerts
