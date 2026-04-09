/**
 * Targeted forensic: Cards, Input Saldo/Celular, Badge_number,
 * Logo types, Sheet details
 */
const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const allNodesPath = path.join(outputDir, 'deep-nodes', 'all-nodes.json');
const compMapPath  = path.join(outputDir, 'components-map.json');

const data     = JSON.parse(fs.readFileSync(allNodesPath, 'utf8'));
const nodesMap = data.nodes;
const compData = JSON.parse(fs.readFileSync(compMapPath, 'utf8'));
const components = compData.meta.components;

const compMeta = {};
components.forEach(c => { compMeta[c.node_id] = c; });

function rgbToHex(r, g, b) {
    return '#' + [r,g,b].map(x => Math.round(x*255).toString(16).toUpperCase().padStart(2,'0')).join('');
}
function getFill(fills) {
    if (!fills || !fills.length) return null;
    const s = fills.find(f => f.visible !== false && f.type === 'SOLID');
    return s && s.color ? rgbToHex(s.color.r, s.color.g, s.color.b) : null;
}
function getStroke(strokes) {
    if (!strokes || !strokes.length) return null;
    const s = strokes.find(s => s.visible !== false && s.type === 'SOLID');
    return s && s.color ? rgbToHex(s.color.r, s.color.g, s.color.b) : null;
}
function summarize(nodeId) {
    const w = nodesMap[nodeId];
    if (!w || !w.document) return null;
    const doc = w.document;
    const bbox = doc.absoluteBoundingBox || {};
    return {
        name: doc.name,
        type: doc.type,
        w: Math.round(bbox.width || 0),
        h: Math.round(bbox.height || 0),
        fill: getFill(doc.fills),
        stroke: getStroke(doc.strokes),
        strokeW: doc.strokeWeight,
        radius: doc.cornerRadius,
        radii: doc.rectangleCornerRadii,
        padT: doc.paddingTop, padR: doc.paddingRight,
        padB: doc.paddingBottom, padL: doc.paddingLeft,
        gap: doc.itemSpacing,
        shadows: doc.effects ? doc.effects.filter(e => e.type && e.type.includes('SHADOW')).map(e => ({
            type: e.type,
            color: e.color ? rgbToHex(e.color.r, e.color.g, e.color.b) : null,
            alpha: e.color ? Math.round((e.color.a || 1) * 100) : null,
            x: e.offset && e.offset.x,
            y: e.offset && e.offset.y,
            blur: e.radius,
            spread: e.spread,
        })) : [],
        children: doc.children ? doc.children.slice(0, 6).map(c => {
            const cb = c.absoluteBoundingBox || {};
            return {
                name: c.name, type: c.type,
                w: Math.round(cb.width || 0), h: Math.round(cb.height || 0),
                fill: getFill(c.fills), stroke: getStroke(c.strokes),
                strokeW: c.strokeWeight,
                radius: c.cornerRadius, padT: c.paddingTop,
                padR: c.paddingRight, padB: c.paddingBottom,
                padL: c.paddingLeft, gap: c.itemSpacing,
            };
        }) : [],
    };
}

// ---- Collect all pages present
const pageSet = new Set();
Object.values(compMeta).forEach(c => {
    if (c.containing_frame && c.containing_frame.pageName)
        pageSet.add(c.containing_frame.pageName);
});
console.log("ALL PAGES IN SYSTEM:\n" + [...pageSet].sort().join('\n'));

// ---- TARGET PAGES
const TARGETS = {
    'Cards': [],
    'Input': [],
    'Badges': [],
    'Logos externos': [],
    'Sheet': [],
    'Adjuntos': [],
    'Muckups': [],
};

Object.entries(compMeta).forEach(([nodeId, meta]) => {
    if (!meta.containing_frame) return;
    const page = meta.containing_frame.pageName || '';
    const found = Object.keys(TARGETS).find(t => page.includes(t));
    if (found) TARGETS[found].push({ nodeId, meta });
});

// ---- Print summary per target
Object.entries(TARGETS).forEach(([target, nodes]) => {
    console.log(`\n========== ${target.toUpperCase()} (${nodes.length} nodes) ==========`);
    if (nodes.length === 0) { console.log('  <NONE FOUND>'); return; }
    
    // Group by compSet name
    const groups = {};
    nodes.forEach(({ nodeId, meta }) => {
        const setName = meta.containing_frame.containingComponentSet
            ? meta.containing_frame.containingComponentSet.name
            : meta.containing_frame.name;
        if (!groups[setName]) groups[setName] = [];
        groups[setName].push(nodeId);
    });
    
    Object.entries(groups).forEach(([name, ids]) => {
        console.log(`\n  -- ${name} (${ids.length} variants) --`);
        // Inspect first 3 variants
        ids.slice(0, 3).forEach(nodeId => {
            const s = summarize(nodeId);
            if (!s) return;
            console.log(`  [${s.name}] ${s.w}×${s.h}px fill=${s.fill||'—'} stroke=${s.stroke||'—'} w=${s.strokeW||'?'} radius=${s.radius||'?'}`);
            if (s.padT != null) console.log(`    Padding: ${s.padT},${s.padR},${s.padB},${s.padL} Gap:${s.gap||'?'}`);
            if (s.shadows && s.shadows.length) {
                s.shadows.forEach(sh => console.log(`    Shadow: ${sh.type} color=${sh.color} alpha=${sh.alpha}% x=${sh.x} y=${sh.y} blur=${sh.blur} spread=${sh.spread}`));
            }
            if (s.radii) console.log(`    CornerRadii: TL=${s.radii[0]} TR=${s.radii[1]} BR=${s.radii[2]} BL=${s.radii[3]}`);
            s.children.forEach(c => {
                console.log(`      child [${c.name}] ${c.w}×${c.h} fill=${c.fill||'—'} stroke=${c.stroke||'—'} strokeW=${c.strokeW||'?'} radius=${c.radius||'?'} pad=${c.padT!=null?`${c.padT},${c.padR},${c.padB},${c.padL}`:'—'} gap=${c.gap||'?'}`);
            });
        });
    });
});
