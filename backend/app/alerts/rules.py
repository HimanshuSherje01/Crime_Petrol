import networkx as nx

def generate_alerts(case_id: str, G: nx.Graph, analytics_results: dict, entity_ids: set = None) -> list:
    alerts = []
    
    if G.number_of_nodes() == 0:
        return alerts

    # Only allow alerts to reference real canonical entities, NOT source file nodes
    is_entity = (lambda n: True) if entity_ids is None else (lambda n: n in entity_ids)

    # 1. High Betweenness Node (Broker/Unknown)
    for node, metrics in analytics_results.items():
        if not is_entity(node):
            continue
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
                # Skip cycles that include source-file nodes (they are not real entities)
                entity_cycle = [n for n in cycle if is_entity(n)]
                if len(entity_cycle) < 3:
                    continue
                alerts.append({
                    "case_id": case_id,
                    "severity": "High",
                    "title": "Suspicious Circular Pattern",
                    "description": f"Detected a circular connection involving {len(entity_cycle)} entities.",
                    "entity_id": entity_cycle[0]
                })
                break # Just add one alert for this to avoid spam
    except:
        pass

    # 3. Dense Subgraph (proxy for shared IMEI / Call burst)
    # Look for nodes with unusually high degree relative to the graph
    avg_degree = sum(dict(G.degree()).values()) / max(1, G.number_of_nodes())
    for node, deg in G.degree():
        if not is_entity(node):
            continue
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
