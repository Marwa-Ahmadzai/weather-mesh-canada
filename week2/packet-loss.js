// Packet loss simulation
let currentPacketLossPercent = 0;
let totalPacketsSent = 0;
let totalPacketsDropped = 0;

let lastLoggedLoss = -1;

function setPacketLoss(percent) {
    currentPacketLossPercent = Math.min(100, Math.max(0, percent));
    document.getElementById('packetLossValue').textContent = currentPacketLossPercent;
    
    // Only log when changed by more than 5% or once per second
    if (Math.abs(lastLoggedLoss - currentPacketLossPercent) >= 5 || lastLoggedLoss === -1) {
        window.uiLog(`📊 Packet loss set to ${currentPacketLossPercent}%`, 'warning');
        lastLoggedLoss = currentPacketLossPercent;
    }
}

function shouldDropPacket() {
    const random = Math.random() * 100;
    const drop = random < currentPacketLossPercent;
    
    if (drop) {
        totalPacketsDropped++;
        const droppedSpan = document.getElementById('droppedCount');
        if (droppedSpan) droppedSpan.textContent = totalPacketsDropped;
        console.log(`[DROP] Packet dropped. Total: ${totalPacketsDropped}`); // Debug
    }
    totalPacketsSent++;
    
    return drop;
}

function resetPacketStats() {
    totalPacketsSent = 0;
    totalPacketsDropped = 0;
    const droppedSpan = document.getElementById('droppedCount');
    if (droppedSpan) droppedSpan.textContent = '0';
}

// Modified version of sendToPeer that includes packet loss
function sendWithPacketLoss(peerManager, targetNodeId, message) {
    if (shouldDropPacket()) {
        console.log(`[PACKET LOSS] Dropped message to ${targetNodeId}`);
        return false;
    }
    
    // Original send logic
    const targetNode = peerManager.nodes.get(targetNodeId);
    if (targetNode && targetNode.isAlive) {
        setTimeout(() => {
            peerManager.channel.postMessage({
                ...message,
                toNodeId: targetNodeId
            });
        }, Math.random() * 90 + 10);
        return true;
    }
    return false;
}

// Export for use
window.packetLossAPI = {
    setPacketLoss,
    shouldDropPacket,
    resetPacketStats,
    sendWithPacketLoss
};