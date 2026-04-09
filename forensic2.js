/**
 * Get all Avatar variant dimensions and explore Skeleton colors
 */
const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const allNodesPath = path.join(outputDir, 'deep-nodes', 'all-nodes.json');
const componentsMapPath = path.join(outputDir, 'components-map.json');

const data = JSON.parse(fs.readFileSync(allNodesPath, 'utf8'));
const nodesMap = data.nodes;
const compMapData = JSON.parse(fs.readFileSync(componentsMapPath, 'utf8'));
const components = compMapData.meta.components;

const compMeta = {};
components.forEach(c => { compMeta[c.node_id] = c; });

function rgbToHex(r, g, b) {
    const toH = x => Math.round(x * 255).toString(16).toUpperCase().padStart(2, '0');
    return `#${toH(r)}${toH(g)}${toH(b)}`;
}

function getFill(fills) {
    if (!fills || !fills.length) return null;
    const solid = fills.find(f => f.visible !== false && f.type === 'SOLID');
    if (solid && solid.color) return rgbToHex(solid.color.r, solid.color.g, solid.color.b);
    return null;
}

// Get ALL Avatar variants
console.log("=== AVATAR - ALL VARIANTS ===");
const avatarVariants = [];
Object.entries(nodesMap).forEach(([nodeId, wrapper]) => {
    const meta = compMeta[nodeId];
    if (!meta || !meta.containing_frame) return;
    const pageName = meta.containing_frame.pageName || '';
    if (!pageName.includes('Avatar')) return;
    const doc = wrapper.document;
    if (!doc) return;
    
    const bbox = doc.absoluteBoundingBox || {};
    const fill = getFill(doc.fills);
    avatarVariants.push({
        name: doc.name,
        width: Math.round(bbox.width || 0),
        height: Math.round(bbox.height || 0),
        cornerRadius: doc.cornerRadius,
        fill
    });
});
avatarVariants.sort((a, b) => a.width - b.width);
console.log("Total Avatar variants:", avatarVariants.length);
const seen = new Set();
avatarVariants.forEach(v => {
    const key = `${v.name}|${v.width}`;
    if (seen.has(key)) return;
    seen.add(key);
    console.log(`  [${v.name}] ${v.width}×${v.height}px | radius=${v.cornerRadius || '?'} | fill=${v.fill || '—'}`);
});

// Get ALL Skeleton variants and their children fills
console.log("\n=== SKELETON - ALL VARIANTS (with children) ===");
Object.entries(nodesMap).forEach(([nodeId, wrapper]) => {
    const meta = compMeta[nodeId];
    if (!meta || !meta.containing_frame) return;
    const pageName = meta.containing_frame.pageName || '';
    if (!pageName.includes('Skeleton')) return;
    const doc = wrapper.document;
    if (!doc) return;
    
    const bbox = doc.absoluteBoundingBox || {};
    const fill = getFill(doc.fills);
    console.log(`  [${doc.name}] ${Math.round(bbox.width || 0)}×${Math.round(bbox.height || 0)}px | fill=${fill || '—'}`);
    
    // Deep children check
    function checkChildren(node, depth) {
        if (depth > 4) return;
        if (node.fills) {
            const f = getFill(node.fills);
            if (f) console.log(`    ${'  '.repeat(depth)}> ${node.name} (${node.type}): fill=${f} radius=${node.cornerRadius || '?'}`);
        }
        if (node.children) node.children.forEach(c => checkChildren(c, depth + 1));
    }
    if (doc.children) doc.children.forEach(c => checkChildren(c, 1));
});

// Get Stepper step data
console.log("\n=== STEPPER STEP COLORS ===");
Object.entries(nodesMap).forEach(([nodeId, wrapper]) => {
    const meta = compMeta[nodeId];
    if (!meta || !meta.containing_frame) return;
    const pageName = meta.containing_frame.pageName || '';
    if (!pageName.includes('Stepper')) return;
    const doc = wrapper.document;
    if (!doc) return;
    
    const bbox = doc.absoluteBoundingBox || {};
    const fill = getFill(doc.fills);
    
    function checkChildren(node, depth) {
        if (depth > 5) return;
        if (node.fills) {
            const f = getFill(node.fills);
            if (f && f !== '#FFFFFF') console.log(`    ${'  '.repeat(depth)}> ${node.name} (${node.type}): fill=${f} ${Math.round(node.absoluteBoundingBox?.width||0)}×${Math.round(node.absoluteBoundingBox?.height||0)}`);
        }
        if (node.strokes && node.strokes.length) {
            node.strokes.forEach(s => {
                if (s.type === 'SOLID' && s.color) {
                    const sh = rgbToHex(s.color.r, s.color.g, s.color.b);
                    console.log(`    ${'  '.repeat(depth)}> ${node.name} stroke: ${sh} w=${node.strokeWeight}`);
                }
            });
        }
        if (node.children) node.children.forEach(c => checkChildren(c, depth + 1));
    }
    
    if (doc.name.includes('Component 11') || doc.name.includes('Estado=')) {
        console.log(`  VARIANT: ${doc.name}`);
        if (doc.children) doc.children.forEach(c => checkChildren(c, 1));
    }
});

// Get Table full row color data
console.log("\n=== TABLE ROW ANALYSIS ===");
const tableVariants = [];
Object.entries(nodesMap).forEach(([nodeId, wrapper]) => {
    const meta = compMeta[nodeId];
    if (!meta || !meta.containing_frame) return;
    const pageName = meta.containing_frame.pageName || '';
    if (!pageName.includes('Table')) return;
    const doc = wrapper.document;
    if (!doc) return;
    
    const bbox = doc.absoluteBoundingBox || {};
    const fill = getFill(doc.fills);
    const stroke = doc.strokes && doc.strokes.length && doc.strokes[0].color 
        ? rgbToHex(doc.strokes[0].color.r, doc.strokes[0].color.g, doc.strokes[0].color.b) 
        : null;
    
    tableVariants.push({
        name: doc.name,
        width: Math.round(bbox.width || 0),
        height: Math.round(bbox.height || 0),
        fill,
        stroke,
        strokeWeight: doc.strokeWeight,
        padding: doc.paddingTop != null ? `${doc.paddingTop},${doc.paddingRight},${doc.paddingBottom},${doc.paddingLeft}` : null,
    });
});
const tableSeen = new Set();
tableVariants.forEach(v => {
    const key = v.name;
    if (tableSeen.has(key)) return;
    tableSeen.add(key);
    console.log(`  [${v.name}] ${v.width}×${v.height}px fill=${v.fill||'—'} border=${v.stroke||'—'} w=${v.strokeWeight||'?'} pad=${v.padding||'—'}`);
});
