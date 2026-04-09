const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';

const componentsMapPath = path.join(outputDir, 'components-map.json');
let components = [];

if (fs.existsSync(componentsMapPath)) {
    const data = JSON.parse(fs.readFileSync(componentsMapPath, 'utf8'));
    // Usually a dictionary or array
    if (Array.isArray(data)) {
        components = data;
    } else {
        components = Object.values(data);
    }
} else {
    console.log("No components-map.json found");
}

console.log(`Found ${components.length} components.`);
const pages = {};

components.forEach(c => {
    const pageName = c.pageName ? c.pageName.trim() : 'Unknown Page';
    if (!pages[pageName]) pages[pageName] = new Set();
    pages[pageName].add(c.name);
});

console.log("Pages and Components Summary:");
for (const page in pages) {
    console.log(`\nPage: ${page}`);
    console.log([...pages[page]].map(n => `  - ${n}`).join('\n'));
}

const allNodesPath = path.join(outputDir, 'deep-nodes', 'all-nodes.json');
if (fs.existsSync(allNodesPath)) {
    // Just get the size, parsing it might be too heavy or informative
    const stats = fs.statSync(allNodesPath);
    console.log(`\nall-nodes.json size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}
