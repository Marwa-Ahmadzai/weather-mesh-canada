class MeshNode {
    constructor(id) {
        this.id = id;
        this.alerts = new Map();
        this.isAlive = true;  // ← CRITICAL: Must be true
        this.peerManager = null;
        this.createdAt = Date.now();
    }

    receiveAlert(alert, fromPeerId) {
        if (!this.isAlive) {
            console.log(`Node ${this.id} is dead, ignoring alert`);
            return false;
        }

        if (this.alerts.has(alert.id)) {
            return false;
        }

        this.alerts.set(alert.id, {
            ...alert,
            receivedAt: Date.now(),
            receivedFrom: fromPeerId
        });

        this.logToUI(`📢 Received "${alert.text}" from ${fromPeerId} (TTL: ${alert.ttl})`, 'warning');

        if (alert.ttl > 0) {
            const forwardedAlert = {
                ...alert,
                ttl: alert.ttl - 1,
                hops: (alert.hops || 0) + 1
            };
            this.peerManager.broadcastToPeers(forwardedAlert, this.id);
        }

        return true;
    }
// Add to mesh/Node.js inside the MeshNode class
getMissingAlerts(otherNodeAlerts) {
    const missing = [];
    for (let [alertId, alert] of otherNodeAlerts) {
        if (!this.alerts.has(alertId)) {
            missing.push(alert);
        }
    }
    return missing;
}

// Also modify the receiveAlert method to handle catch-up alerts differently
// Find this line: receiveAlert(alert, fromPeerId) {
// And add this check at the beginning:

receiveAlert(alert, fromPeerId, isCatchup = false) {
    if (!this.isAlive) return false;
    
    // Catch-up alerts don't get forwarded (prevents flooding)
    if (isCatchup) {
        if (!this.alerts.has(alert.id)) {
            this.alerts.set(alert.id, {
                ...alert,
                receivedAt: Date.now(),
                receivedFrom: fromPeerId,
                wasCatchup: true
            });
            this.logToUI(`📦 CAUGHT UP: "${alert.text}" (missed while offline)`, 'warning');
        }
        return true;
    }
    
    // Original receive logic continues here...
    if (this.alerts.has(alert.id)) return false;
    
    this.alerts.set(alert.id, {
        ...alert,
        receivedAt: Date.now(),
        receivedFrom: fromPeerId
    });
    
    this.logToUI(`📢 Received "${alert.text}" from ${fromPeerId} (TTL: ${alert.ttl})`, 'warning');
    
    if (alert.ttl > 0) {
        const forwardedAlert = {
            ...alert,
            ttl: alert.ttl - 1,
            hops: (alert.hops || 0) + 1
        };
        this.peerManager.broadcastToPeers(forwardedAlert, this.id);
    }
    
    return true;
}
    createAlert(text, ttl = 5) {
        if (!this.isAlive) return null;

        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            text: text,
            timestamp: Date.now(),
            ttl: ttl,
            hops: 0,
            sourceNode: this.id
        };

        this.alerts.set(alert.id, alert);
        this.logToUI(`🌪️ CREATED new alert: "${text}" (TTL: ${ttl})`, 'warning');
        this.peerManager.broadcastToPeers(alert, this.id);
        
        return alert;
    }

    die() {
        this.isAlive = false;
        this.logToUI(`💀 Node ${this.id} has DIED`, 'warning');
    }

    revive() {
        this.isAlive = true;
        this.logToUI(`✨ Node ${this.id} has REVIVED`, 'warning');
    }

    logToUI(message, type = 'info') {
        if (window.uiLog) {
            window.uiLog(message, type);
        }
    }
    // Add to mesh/Node.js inside the MeshNode class
getMissingAlerts(otherNodeAlerts) {
    const missing = [];
    for (let [alertId, alert] of otherNodeAlerts) {
        if (!this.alerts.has(alertId)) {
            missing.push(alert);
        }
    }
    return missing;
}

// Also modify the receiveAlert method to handle catch-up alerts differently
// Find this line: receiveAlert(alert, fromPeerId) {
// And add this check at the beginning:

receiveAlert(alert, fromPeerId, isCatchup = false) {
    if (!this.isAlive) return false;
    
    // Catch-up alerts don't get forwarded (prevents flooding)
    if (isCatchup) {
        if (!this.alerts.has(alert.id)) {
            this.alerts.set(alert.id, {
                ...alert,
                receivedAt: Date.now(),
                receivedFrom: fromPeerId,
                wasCatchup: true
            });
            this.logToUI(`📦 CAUGHT UP: "${alert.text}" (missed while offline)`, 'warning');
        }
        return true;
    }
    
    // Original receive logic continues here...
    if (this.alerts.has(alert.id)) return false;
    
    this.alerts.set(alert.id, {
        ...alert,
        receivedAt: Date.now(),
        receivedFrom: fromPeerId
    });
    
    this.logToUI(`📢 Received "${alert.text}" from ${fromPeerId} (TTL: ${alert.ttl})`, 'warning');
    
    if (alert.ttl > 0) {
        const forwardedAlert = {
            ...alert,
            ttl: alert.ttl - 1,
            hops: (alert.hops || 0) + 1
        };
        this.peerManager.broadcastToPeers(forwardedAlert, this.id);
    }
    
    return true;
}

    getInfo() {
        return {
            id: this.id,
            isAlive: this.isAlive,
            alertCount: this.alerts.size,
            createdAt: this.createdAt
        };
    }
}