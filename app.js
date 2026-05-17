// Global state
let peerManager = null;
let nextNodeId = 1;

// UI elements
const addNodeBtn = document.getElementById('addNodeBtn');
const createAlertBtn = document.getElementById('createAlertBtn');
const resetBtn = document.getElementById('resetBtn');
const nodeCountSpan = document.getElementById('nodeCount');
const alertCountSpan = document.getElementById('alertCount');
const nodesListDiv = document.getElementById('nodesList');
const alertLogDiv = document.getElementById('alertLog');

window.uiLog = (message, type = 'info') => {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type === 'warning' ? 'warning' : ''}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    alertLogDiv.insertBefore(logEntry, alertLogDiv.firstChild);
    
    while (alertLogDiv.children.length > 50) {
        alertLogDiv.removeChild(alertLogDiv.lastChild);
    }
};

function createNode() {
    if (!peerManager) {
        peerManager = new PeerManager();
    }
    
    const nodeId = `node_${nextNodeId++}`;
    const newNode = new MeshNode(nodeId);
    
    // Verify node is alive before registering
    console.log(`Creating node ${nodeId}, alive = ${newNode.isAlive}`);
    
    peerManager.registerNode(newNode);
    
    window.uiLog(`✅ Node ${nodeId} joined the mesh network`);
    
    // Small delay to ensure UI updates properly
    setTimeout(() => {
        updateUI();
    }, 50);
    
    if (peerManager.getActiveNodeCount() >= 2) {
        createAlertBtn.disabled = false;
    }
}

function createRandomAlert() {
    const alerts = [
        "🌪️ Tornado warning - Take shelter immediately",
        "🌊 Flash flood - Avoid low areas",
        "⚡ Severe thunderstorm - Stay indoors",
        "❄️ Extreme cold warning - Frostbite risk",
        "🔥 Wildfire smoke - Poor air quality",
        "🌀 Hurricane watch - Prepare emergency kit",
        "⛈️ Hail warning - Protect vehicles",
        "💨 High wind warning - Secure outdoor items"
    ];
    
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    const activeNodes = peerManager.getAllNodes().filter(n => n.isAlive);
    
    if (activeNodes.length === 0) {
        window.uiLog("❌ No active nodes to create alert");
        return;
    }
    
    const sourceNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
    sourceNode.createAlert(randomAlert, 5);
    
    setTimeout(() => {
        updateUI();
    }, 100);
}

function updateUI() {
    if (!peerManager) {
        nodeCountSpan.textContent = '0';
        alertCountSpan.textContent = '0';
        nodesListDiv.innerHTML = 'No nodes yet. Click "Add Node".';
        return;
    }
    
    const nodes = peerManager.getAllNodes();
    const activeNodes = nodes.filter(n => n.isAlive);
    nodeCountSpan.textContent = activeNodes.length;
    
    let totalAlerts = 0;
    nodes.forEach(node => {
        totalAlerts += node.alerts.size;
    });
    alertCountSpan.textContent = totalAlerts;
    
    if (nodes.length === 0) {
        nodesListDiv.innerHTML = 'No nodes yet. Click "Add Node".';
    } else {
        nodesListDiv.innerHTML = nodes.map(node => {
            const status = node.isAlive ? '🟢 Alive' : '🔴 Dead';
            return `
                <div class="node-card ${!node.isAlive ? 'dead' : ''}">
                    <strong>${node.id}</strong><br>
                    Status: ${status}<br>
                    Alerts seen: ${node.alerts.size}<br>
                    <button onclick="killNode('${node.id}')" ${!node.isAlive ? 'disabled' : ''}>💀 Kill</button>
                    <button onclick="reviveNode('${node.id}')" ${node.isAlive ? 'disabled' : ''}>✨ Revive</button>
                </div>
            `;
        }).join('');
    }
}

function killNode(nodeId) {
    const node = peerManager.getNode(nodeId);
    if (node && node.isAlive) {
        node.die();
        window.uiLog(`💀 Node ${nodeId} was KILLED (simulating device failure)`);
        updateUI();
        
        if (peerManager.getActiveNodeCount() < 2) {
            createAlertBtn.disabled = true;
        }
    }
}

function reviveNode(nodeId) {
    const node = peerManager.getNode(nodeId);
    if (node && !node.isAlive) {
        node.revive();
        window.uiLog(`✨ Node ${nodeId} was REVIVED (back online)`, 'warning');
        updateUI();
        
        // STORE & FORWARD: Request missed alerts from neighbors
        setTimeout(() => {
            window.uiLog(`🔄 Node ${nodeId} checking for missed alerts...`, 'warning');
            
            // Get all alive neighbors
            const neighbors = peerManager.getAllNodes().filter(n => n.isAlive && n.id !== nodeId);
            
            neighbors.forEach(neighbor => {
                // Find alerts neighbor has that this node doesn't
                const missingAlerts = [];
                for (let [alertId, alert] of neighbor.alerts) {
                    if (!node.alerts.has(alertId)) {
                        missingAlerts.push(alert);
                    }
                }
                
                if (missingAlerts.length > 0) {
                    window.uiLog(`📦 Node ${nodeId} received ${missingAlerts.length} missed alerts from ${neighbor.id}`, 'warning');
                    
                    // Add missing alerts to revived node
                    missingAlerts.forEach(alert => {
                        if (!node.alerts.has(alert.id)) {
                            node.alerts.set(alert.id, {
                                ...alert,
                                receivedAt: Date.now(),
                                receivedFrom: neighbor.id,
                                wasCatchup: true
                            });
                            window.uiLog(`   📋 Caught up: "${alert.text.substring(0, 50)}..."`, 'info');
                        }
                    });
                }
            });
            
            updateUI();
            window.uiLog(`✅ Node ${nodeId} sync complete. Now has ${node.alerts.size} alerts`, 'warning');
        }, 500);
        
        if (peerManager.getActiveNodeCount() >= 2) {
            createAlertBtn.disabled = false;
        }
    }
}

function resetAll() {
    peerManager = null;
    nextNodeId = 1;
    alertLogDiv.innerHTML = 'Waiting for alerts...';
    window.uiLog("🔄 System reset - All nodes removed");
    updateUI();
    createAlertBtn.disabled = true;
}
// Week 2: Initialize map and controls
setTimeout(() => {
    if (window.mapAPI) {
        window.mapAPI.initMap();
    }
}, 100);

// Packet loss slider
const packetLossSlider = document.getElementById('packetLossSlider');
if (packetLossSlider) {
    packetLossSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        if (window.packetLossAPI) {
            window.packetLossAPI.setPacketLoss(parseInt(value));
        }
    });
}

// Partition controls
const partitionBtn = document.getElementById('partitionBtn');
const healPartitionBtn = document.getElementById('healPartitionBtn');

if (partitionBtn) {
    partitionBtn.addEventListener('click', () => {
        if (window.partitionAPI && peerManager) {
            window.partitionAPI.partitionNetwork();
        } else if (!peerManager) {
            window.uiLog("Create some nodes first!", 'warning');
        }
    });
}

if (healPartitionBtn) {
    healPartitionBtn.addEventListener('click', () => {
        if (window.partitionAPI) {
            window.partitionAPI.healPartition();
        }
    });
}
// Week 3: Store & Forward + Real Weather
let storeForward = null;

// Modified reviveNode function to trigger catch-up
const originalReviveNode = reviveNode;
window.reviveNode = function(nodeId) {
    originalReviveNode(nodeId);
    // After reviving, request missed alerts
    setTimeout(() => {
        if (storeForward && peerManager) {
            storeForward.requestMissedAlerts(nodeId);
        }
    }, 500);
};

// Override the global reviveNode
reviveNode = window.reviveNode;

// Initialize store-forward when nodes exist
function initWeek3() {
    if (peerManager && !storeForward) {
        storeForward = initStoreForward(peerManager);
        addRealWeatherButton();
        window.uiLog("🌟 Week 3: Store & Forward + Real Weather Data ACTIVE", 'warning');
    }
}

// Call initWeek3 after nodes are created
const originalCreateNode = createNode;
window.createNode = function() {
    originalCreateNode();
    setTimeout(initWeek3, 100);
};
createNode = window.createNode;
addNodeBtn.addEventListener('click', createNode);
createAlertBtn.addEventListener('click', createRandomAlert);
resetBtn.addEventListener('click', resetAll);

updateUI();
window.uiLog("🚀 Weather Mesh Simulator ready. Click 'Add Node' to start building your mesh network!");