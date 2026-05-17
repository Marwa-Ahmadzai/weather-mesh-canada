class PeerManager {
    constructor() {
        this.nodes = new Map(); // id -> MeshNode instance
        this.channel = new BroadcastChannel('weather-mesh-canada');
        this.setupChannelListener();
    }

    setupChannelListener() {
        this.channel.onmessage = (event) => {
            const { type, data, fromNodeId, alert } = event.data;
            
            if (type === 'ALERT') {
                // Forward alert to the target node
                const targetNode = this.nodes.get(data.targetNodeId);
                if (targetNode && targetNode.isAlive) {
                    targetNode.receiveAlert(alert, fromNodeId);
                }
            } else if (type === 'PEER_ANNOUNCE') {
                // A new node is announcing itself
                console.log(`Peer ${data.nodeId} announced itself`);
                this.announceExistingPeers(data.nodeId);
            }
            // Add this case inside the onmessage switch/if statements
else if (type === 'CATCHUP_ALERT') {
    const targetNode = this.nodes.get(data.targetNodeId);
    if (targetNode && targetNode.isAlive) {
        targetNode.receiveAlert(alert, fromNodeId, true); // true = isCatchup
    }
}
        };
    }

    registerNode(node) {
    console.log(`[DEBUG] Registering node ${node.id}, isAlive = ${node.isAlive}`);
    this.nodes.set(node.id, node);
    node.peerManager = this;
    
    // Small delay to ensure node is fully initialized
    setTimeout(() => {
        // Announce this new node to all existing nodes
        this.broadcastToAllPeers({
            type: 'PEER_ANNOUNCE',
            data: { nodeId: node.id }
        }, node.id);
        
        // Also announce existing peers to the new node
        this.announceExistingPeers(node.id);
    }, 10);
    
    return true;
}

    announceExistingPeers(newNodeId) {
        for (let [peerId, peerNode] of this.nodes) {
            if (peerId !== newNodeId && peerNode.isAlive) {
                // Tell the new node about each existing peer
                const newPeerNode = this.nodes.get(newNodeId);
                if (newPeerNode && newPeerNode.isAlive) {
                    this.sendToPeer(newNodeId, {
                        type: 'PEER_ANNOUNCE',
                        data: { nodeId: peerId }
                    });
                }
            }
        }
    }

    broadcastToPeers(alert, senderNodeId) {
        for (let [peerId, peerNode] of this.nodes) {
            if (peerId !== senderNodeId && peerNode.isAlive) {
                this.sendToPeer(peerId, {
                    type: 'ALERT',
                    alert: alert,
                    fromNodeId: senderNodeId,
                    data: { targetNodeId: peerId }
                });
            }
        }
    }

    broadcastToAllPeers(message, excludeNodeId = null) {
        for (let [peerId, peerNode] of this.nodes) {
            if (peerId !== excludeNodeId && peerNode.isAlive) {
                this.sendToPeer(peerId, message);
            }
        }
    }

    sendToPeer(targetNodeId, message) {
        const targetNode = this.nodes.get(targetNodeId);
        if (targetNode && targetNode.isAlive) {
            // Simulate network delay (10-100ms)
            setTimeout(() => {
                this.channel.postMessage({
                    ...message,
                    toNodeId: targetNodeId
                });
            }, Math.random() * 90 + 10);
        }
    }

    getNode(id) {
        return this.nodes.get(id);
    }

    getAllNodes() {
        return Array.from(this.nodes.values());
    }

    removeNode(id) {
        const node = this.nodes.get(id);
        if (node) {
            node.die();
            // Keep in map but marked dead (for history)
        }
    }

    getActiveNodeCount() {
        return Array.from(this.nodes.values()).filter(n => n.isAlive).length;
    }
}