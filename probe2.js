const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const allNodesPath = path.join(outputDir, 'deep-nodes', 'all-nodes.json');

const raw = fs.readFileSync(allNodesPath, 'utf8');
const allNodes = JSON.parse(raw);

// Probe the top-level structure
console.log("Top-level keys:", Object.keys(allNodes).slice(0, 10).join(', '));
const firstKey = Object.keys(allNodes)[0];
console.log("First key:", firstKey);
const firstVal = allNodes[firstKey];
console.log("First value type:", typeof firstVal);
if (typeof firstVal === 'object') {
    console.log("First value keys:", Object.keys(firstVal).slice(0, 20).join(', '));
    console.log("First value.name:", firstVal.name);
    console.log("First value.type:", firstVal.type);
}
