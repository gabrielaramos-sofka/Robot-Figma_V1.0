const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const allNodesPath = path.join(outputDir, 'deep-nodes', 'all-nodes.json');

const allNodes = JSON.parse(fs.readFileSync(allNodesPath, 'utf8'));

// Find a button component to inspect
let buttonInstance = null;
for (const key in allNodes) {
    const node = allNodes[key];
    if (node.name && node.name.toLowerCase().includes('boton') && node.type === 'COMPONENT') {
        buttonInstance = node;
        break;
    }
}

if (!buttonInstance) {
    for (const key in allNodes) {
        const node = allNodes[key];
        if (node.type === 'COMPONENT') {
            buttonInstance = node;
            break;
        }
    }
}

console.log("Inspecting Node: ", buttonInstance.name);

function summarizeNode(n, depth = 0) {
    const pad = ' '.repeat(depth * 2);
    let str = `${pad}- [${n.type}] ${n.name}\n`;
    
    const props = [];
    if (n.width) props.push(`W:${n.width}`);
    if (n.height) props.push(`H:${n.height}`);
    if (n.fills && n.fills.length) props.push(`Fills:${n.fills.length}`);
    if (n.strokes && n.strokes.length) props.push(`Strokes:${n.strokes.length}`);
    if (n.cornerRadius) props.push(`Radius:${n.cornerRadius}`);
    if (n.paddingLeft) props.push(`Pad:${n.paddingTop} ${n.paddingRight} ${n.paddingBottom} ${n.paddingLeft}`);
    if (n.itemSpacing) props.push(`Gap:${n.itemSpacing}`);
    if (n.style) {
        if (n.style.fontFamily) props.push(`Font:${n.style.fontFamily} ${n.style.fontWeight} ${n.style.fontSize}`);
    }
    if (n.componentProperties) {
       props.push(`Variants:${Object.keys(n.componentProperties).length}`);
    }
    
    if (props.length > 0) str += `${pad}  Props: ${props.join(', ')}\n`;
    
    if (n.children) {
        n.children.forEach(c => {
            str += summarizeNode(c, depth + 1);
        });
    }
    return str;
}

console.log(summarizeNode(buttonInstance));

// Check what component properties look like
if (buttonInstance.componentProperties) {
    console.log("Component Properties:");
    console.log(JSON.stringify(buttonInstance.componentProperties, null, 2));
}

// Check how fills are defined
if (buttonInstance.fills) {
    console.log("Fills:");
    console.log(JSON.stringify(buttonInstance.fills, null, 2));
}
