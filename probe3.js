const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const allNodesPath = path.join(outputDir, 'deep-nodes', 'all-nodes.json');

const raw = fs.readFileSync(allNodesPath, 'utf8');
const data = JSON.parse(raw);
const nodesMap = data.nodes; // keyed by nodeId

// Each value is a node object? Let's check
const firstNodeId = Object.keys(nodesMap)[0];
const firstNode = nodesMap[firstNodeId];

console.log("First node id:", firstNodeId);
console.log("First node keys:", Object.keys(firstNode || {}).join(', '));

// There might be a .document key inside each node
if (firstNode && firstNode.document) {
    console.log("Has .document!");
    console.log("Document keys:", Object.keys(firstNode.document).join(', '));
    console.log("Document name:", firstNode.document.name);
    console.log("Document type:", firstNode.document.type);
    console.log("Document width:", firstNode.document.absoluteBoundingBox);
    console.log("Document fills:", JSON.stringify(firstNode.document.fills));
    if (firstNode.document.children) {
        console.log("Document children count:", firstNode.document.children.length);
    }
} else {
    // Maybe the node IS the document
    console.log("Node IS the document?");
    console.log("Node name:", firstNode && firstNode.name);
    console.log("Node type:", firstNode && firstNode.type);
}
