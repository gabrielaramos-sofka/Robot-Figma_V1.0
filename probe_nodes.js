const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const allNodesPath = path.join(outputDir, 'deep-nodes', 'all-nodes.json');

const raw = fs.readFileSync(allNodesPath, 'utf8');
const allNodes = JSON.parse(raw);

// The all-nodes.json could be an array or object
let nodeList = [];
if (Array.isArray(allNodes)) {
    nodeList = allNodes;
} else if (allNodes.nodes) {
    nodeList = allNodes.nodes;
} else {
    nodeList = Object.values(allNodes);
}

console.log("Total nodes:", nodeList.length);
console.log("Types of first 5:");
nodeList.slice(0, 5).forEach(n => {
    console.log(" Name:", n.name, " | Type:", n.type);
});

// Check structure of one complete node
console.log("\nFirst node keys:", Object.keys(nodeList[0] || {}));

// Find all unique types
const types = new Set(nodeList.map(n => n.type));
console.log("\nNode types:", [...types].join(', '));

// Find a button COMPONENT_SET
const buttonSet = nodeList.find(n => 
    n.type === 'COMPONENT_SET' && n.name && 
    (n.name.toLowerCase().includes('boton') || n.name.toLowerCase().includes('bot'))
);
if (buttonSet) {
    console.log("\nButton component set found:", buttonSet.name);
    console.log("Width:", buttonSet.width, "Height:", buttonSet.height);
    console.log("Children count:", buttonSet.children ? buttonSet.children.length : 0);
    if (buttonSet.children && buttonSet.children.length > 0) {
        const firstChild = buttonSet.children[0];
        console.log("First variant keys:", Object.keys(firstChild));
        console.log("First variant fills:", JSON.stringify(firstChild.fills, null, 2));
        console.log("First variant absolute bounding box:", firstChild.absoluteBoundingBox);
    }
}
