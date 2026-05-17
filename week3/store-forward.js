// Store & Forward Protocol for Week 3
// Allows dead nodes to catch up on missed alerts when revived

class StoreForward {
    constructor(peerManager) {
        this.peerManager = peerManager;
        this.pendingSyncs = new Map(); // nodeId -> timeout
    }

    // When a node revives, request missed alerts from neighbors
    requestMissedAlerts(nodeId) {
        const node = this.peerManager.getNode(nodeId);
        if (!node || !node.isAlive) return;

        // Get all alerts this node has
        const nodeAlertIds = new Set(node.alerts.keys());
        
        // Ask each neighbor for alerts they have that this node doesn't
        const neighbors = this.peerManager.getAllNodes().filter(n => n.isAlive && n.id !== nodeId);
        
        neighbors.forEach(neighbor => {
            const neighborAlertIds = new Set(neighbor.alerts.keys());
            const missingAlerts = Array.from(neighborAlertIds).filter(id => !nodeAlertIds.has(id));
            
            if (missingAlerts.length > 0) {
                window.uiLog(`🔄 Node ${nodeId} requesting ${missingAlerts.length} missed alerts from ${neighbor.id}`, 'warning');
                
                // Send missing alerts to the revived node
                missingAlerts.forEach(alertId => {
                    const alert = neighbor.alerts.get(alertId);
                    if (alert) {
                        // Send with special flag for catch-up
                        this.peerManager.sendToPeer(nodeId, {
                            type: 'CATCHUP_ALERT',
                            alert: alert,
                            fromNodeId: neighbor.id,
                            isCatchup: true
                        });
                    }
                });
            }
        });
    }

    // Handle catch-up alerts (don't forward further to avoid flooding)
    handleCatchupAlert(node, alert, fromNodeId) {
        if (!node.alerts.has(alert.id)) {
            node.alerts.set(alert.id, {
                ...alert,
                receivedAt: Date.now(),
                receivedFrom: fromNodeId,
                wasCatchup: true
            });
            window.uiLog(`📦 Node ${node.id} caught up on missed alert: "${alert.text}" (from ${fromNodeId})`, 'warning');
            return true;
        }
        return false;
    }

    // Get sync status for UI
    getSyncStatus(nodeId) {
        const node = this.peerManager.getNode(nodeId);
        if (!node) return { alertCount: 0, isAlive: false };
        
        return {
            alertCount: node.alerts.size,
            isAlive: node.isAlive,
            alerts: Array.from(node.alerts.values()).map(a => ({ 
                text: a.text, 
                timestamp: a.timestamp,
                wasCatchup: a.wasCatchup || false
            }))
        };
    }
}

// Singleton instance
let storeForwardInstance = null;

function initStoreForward(peerManager) {
    storeForwardInstance = new StoreForward(peerManager);
    return storeForwardInstance;
}

window.StoreForward = StoreForward;
window.initStoreForward = initStoreForward;