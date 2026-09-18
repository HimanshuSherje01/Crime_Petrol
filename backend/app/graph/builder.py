import networkx as nx
from typing import Dict, List

def build_graph(canonical_entities: Dict, text_to_id: Dict) -> nx.Graph:
    """
    Builds a NetworkX graph from canonical entities.
    Nodes: Entities + Source Files
    Edges: MENTIONED_IN (Entity -> File), ASSOCIATED_WITH (Entity -> Entity in same file)
    """
    G = nx.Graph()
    
    file_nodes = {}
    
    for e_id, e_data in canonical_entities.items():
        # Add Entity Node
        G.add_node(e_id, type=e_data["type"], name=e_data["name"])
        
        # Link to Source Files
        for file_name in e_data.get("files", []):
            if file_name not in file_nodes:
                # Determine file type
                file_type = "DOCUMENT"
                if file_name.endswith(".png"): file_type = "CCTV"
                elif file_name.endswith(".wav") or "transcript" in file_name: file_type = "AUDIO"
                elif "fir" in file_name.lower(): file_type = "FIR"
                
                G.add_node(file_name, type=file_type, name=file_name)
                file_nodes[file_name] = []
                
            G.add_edge(e_id, file_name, type="MENTIONED_IN", weight=1.0)
            file_nodes[file_name].append(e_id)

    # Create ASSOCIATED_WITH edges for entities in the same file
    for file_name, entities_in_file in file_nodes.items():
        for i in range(len(entities_in_file)):
            for j in range(i + 1, len(entities_in_file)):
                e1 = entities_in_file[i]
                e2 = entities_in_file[j]
                
                # Check if edge already exists to increment weight
                if G.has_edge(e1, e2):
                    G[e1][e2]['weight'] += 1.0
                else:
                    G.add_edge(e1, e2, type="ASSOCIATED_WITH", weight=1.0)
                    
    return G
