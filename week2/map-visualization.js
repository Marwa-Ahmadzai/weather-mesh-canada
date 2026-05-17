// Map visualization for Week 2
let meshMap = null;
let nodeMarkers = new Map(); // nodeId -> marker
let alertLines = []; // Store drawn lines

function initMap() {
    if (meshMap) return;
    
    // Center on Canada (roughly)
    meshMap = L.map('meshMap').setView([56.1304, -106.3468], 4);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(meshMap);
}

function addNodeToMap(nodeId, isAlive = true, partition = null) {
    if (!meshMap) initMap();
    
    // Random Canadian location (spread across populated areas)
    const locations = [
        [49.2827, -123.1207], // Vancouver
        [51.0447, -114.0719], // Calgary
        [53.5461, -113.4938], // Edmonton
        [50.4488, -104.6172], // Regina
        [49.8951, -97.1384],  // Winnipeg
        [43.6532, -79.3832],  // Toronto
        [45.4215, -75.6972],  // Ottawa
        [45.5017, -73.5673],  // Montreal
        [46.8139, -71.2080],  // Quebec City
        [44.6488, -63.5752],  // Halifax
        [47.5615, -52.7126],  // St. John's
        [60.7212, -135.0568]  // Whitehorse
    ];
    
    // Use node ID to pick a consistent location
    const index = parseInt(nodeId.split('_')[1]) % locations.length;
    const position = locations[index];
    
    // Choose marker color based on status and partition
    let markerColor = isAlive ? 'green' : 'gray';
    if (partition && isAlive) {
        markerColor = partition === 'A' ? 'blue' : 'red';
    }
    
    const marker = L.circleMarker(position, {
        radius: 10,
        fillColor: markerColor,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(meshMap);
    
    marker.bindPopup(`
        <strong>${nodeId}</strong><br>
        Status: ${isAlive ? '🟢 Online' : '🔴 Offline'}<br>
        Partition: ${partition || 'None'}
    `);
    
    nodeMarkers.set(nodeId, marker);
}

function removeNodeFromMap(nodeId) {
    const marker = nodeMarkers.get(nodeId);
    if (marker) {
        meshMap.removeLayer(marker);
        nodeMarkers.delete(nodeId);
    }
}

function drawAlertPath(fromNodeId, toNodeId, alertText) {
    if (!meshMap) return;
    
    const fromMarker = nodeMarkers.get(fromNodeId);
    const toMarker = nodeMarkers.get(toNodeId);
    
    if (!fromMarker || !toMarker) return;
    
    const fromLatLng = fromMarker.getLatLng();
    const toLatLng = toMarker.getLatLng();
    
    // Draw a temporary line
    const line = L.polyline([fromLatLng, toLatLng], {
        color: 'red',
        weight: 3,
        opacity: 0.6,
        dashArray: '5, 10'
    }).addTo(meshMap);
    
    alertLines.push(line);
    
    // Fade and remove after 2 seconds
    setTimeout(() => {
        meshMap.removeLayer(line);
        alertLines = alertLines.filter(l => l !== line);
    }, 2000);
}

function updateNodeStatus(nodeId, isAlive, partition = null) {
    const marker = nodeMarkers.get(nodeId);
    if (marker) {
        let color = isAlive ? 'green' : 'gray';
        if (partition && isAlive) {
            color = partition === 'A' ? 'blue' : 'red';
        }
        marker.setStyle({ fillColor: color });
        marker.getPopup().setContent(`
            <strong>${nodeId}</strong><br>
            Status: ${isAlive ? '🟢 Online' : '🔴 Offline'}<br>
            Partition: ${partition || 'None'}
        `);
    }
}

// Export for use in app.js
window.mapAPI = {
    initMap,
    addNodeToMap,
    removeNodeFromMap,
    drawAlertPath,
    updateNodeStatus
};