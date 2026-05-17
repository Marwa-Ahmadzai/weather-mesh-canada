// Network partition simulation
let isPartitioned = false;
let nodePartitions = new Map(); // nodeId -> 'A' or 'B'

function partitionNetwork() {
    if (isPartitioned) {
        window.uiLog("Network is already partitioned. Heal it first.", 'warning');
        return;
    }
    
    isPartitioned = true;
    
    // Split nodes into two groups
    const nodes = peerManager.getAllNodes();
    const midPoint = Math.floor(nodes.length / 2);
    
    nodes.forEach((node, index) => {
        const partition = index < midPoint ? 'A' : 'B';
        nodePartitions.set(node.id, partition);
        
        // Update map visualization
        if (window.mapAPI) {
            window.mapAPI.updateNodeStatus(node.id, node.isAlive, partition);
        }
    });
    
    window.uiLog(`🔲 NETWORK PARTITIONED: Group A (${nodes.slice(0, midPoint).length} nodes) and Group B (${nodes.slice(midPoint).length} nodes)`, 'warning');
    document.getElementById('partitionStatus').textContent = '⚠️ PARTITION ACTIVE - Groups cannot communicate';
    document.getElementById('partitionStatus').style.color = '#e74c3c';
}

function healPartition() {
    if (!isPartitioned) {
        window.uiLog("Network is not partitioned", 'info');
        return;
    }
    
    isPartitioned = false;
    nodePartitions.clear();
    
    // Update map to remove partition colors
    const nodes = peerManager.getAllNodes();
    nodes.forEach(node => {
        if (window.mapAPI) {
            window.mapAPI.updateNodeStatus(node.id, node.isAlive, null);
        }
    });
    
    window.uiLog("🔗 NETWORK HEALED - All nodes can now communicate", 'warning');
    document.getElementById('partitionStatus').textContent = '✅ Network healthy';
    document.getElementById('partitionStatus').style.color = '#28a745';
}

function canCommunicate(nodeId1, nodeId2) {
    if (!isPartitioned) return true;
    
    const partition1 = nodePartitions.get(nodeId1);
    const partition2 = nodePartitions.get(nodeId2);
    
    // If either node has no partition (just added during partition), allow communication
    if (!partition1 || !partition2) return true;
    
    return partition1 === partition2;
}

window.partitionAPI = {
    partitionNetwork,
    healPartition,
    canCommunicate,
    isPartitioned: () => isPartitioned
};