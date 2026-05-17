# 🌨️ Weather Mesh Canada

### Peer-to-Peer Mesh Network Simulator for Emergency Weather Alerts

[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://marwa-ahmadzai.github.io/weather-mesh-canada)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 📌 Overview

**Weather Mesh Canada** is a fully functional peer-to-peer mesh network simulation that demonstrates how emergency weather alerts can propagate through a network without relying on central servers or internet connectivity. This project is designed for rural and remote Canadian communities where cellular service and internet access are often unreliable or unavailable.

### Why This Matters

- **31% of rural Canadians** lack reliable high-speed internet
- **200+ long-term drinking water advisories** exist in Canadian First Nations communities
- **Extreme weather events** (tornados, floods, ice storms) frequently knock out traditional communication infrastructure

This simulator proves that **mesh networking** can solve these problems by allowing devices to communicate directly with each other.

---

## 🚀 Live Demo

**Try it now:** [https://marwa-ahmadzai.github.io/weather-mesh-canada](https://marwa-ahmadzai.github.io/weather-mesh-canada)

No installation required. Works in any modern browser.

---

## ✨ Features

### Core Networking
| Feature | Description |
|---------|-------------|
| **Gossip Protocol** | Alerts spread randomly from node to node (epidemic routing) |
| **TTL (Time-to-Live)** | Prevents infinite loops (alerts expire after 5 hops) |
| **Store & Forward** | Offline nodes catch up on missed alerts when reconnected |
| **Failure Detection** | Nodes can be killed/revived to simulate device failures |

### Simulation Controls
| Control | What It Does |
|---------|--------------|
| **Packet Loss Slider** | Simulates 0-100% message loss (bad weather = 70% loss) |
| **Network Partition** | Splits mesh into two isolated groups (simulates tower failure) |
| **Heal Network** | Reconnects partitioned groups |

### Visualization
| Feature | Description |
|---------|-------------|
| **Canada Map** | Nodes appear as dots across major Canadian cities |
| **Alert Paths** | Red dashed lines show how alerts travel between nodes |
| **Real-time Log** | Complete history of all alerts and sync events |

### Canadian Integration
| Feature | Description |
|---------|-------------|
| **Real Weather Data** | Fetches realistic alerts (tornado, flood, extreme cold, etc.) |
| **City Locations** | Vancouver, Calgary, Toronto, Montreal, Halifax, and more |

---

## 🛠️ Technical Architecture

### Networking Protocols Implemented

```javascript
// Gossip Protocol - Each node tells random neighbors
broadcastToPeers(alert, senderId) {
    for (let peer of this.nodes) {
        if (peer !== senderId && peer.isAlive) {
            peer.receiveAlert(alert);
        }
    }
}

// Store & Forward - Catch up missed alerts
requestMissedAlerts(nodeId) {
    const neighbors = this.getAliveNeighbors(nodeId);
    neighbors.forEach(neighbor => {
        const missingAlerts = neighbor.getAlerts().filter(
            alert => !node.hasAlert(alert.id)
        );
        node.receiveAlerts(missingAlerts);
    });
}
