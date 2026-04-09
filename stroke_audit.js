/**
 * Full stroke/border audit + Cards extraction
 * Extracts ALL stroke colors per variant/state across every component
 */
const fs  = require('fs');
const path = require('path');

const outDir  = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const nodesFile = path.join(outDir, 'deep-nodes', 'all-nodes.json');
const compFile  = path.join(outDir, 'components-map.json');

const { nodes } = JSON.parse(fs.readFileSync(nodesFile, 'utf8'));
const { meta }  = JSON.parse(fs.readFileSync(compFile,  'utf8'));

const compMeta = {};
meta.components.forEach(c => { compMeta[c.node_id] = c; });

const hex = (r,g,b) => '#' + [r,g,b].map(v => Math.round(v*255).toString(16).toUpperCase().padStart(2,'0')).join('');
const fill   = arr => { if (!arr?.length) return null; const s = arr.find(f=>f.visible!==false&&f.type==='SOLID'); return s?.color?hex(s.color.r,s.color.g,s.color.b):null; };
const stroke = arr => { if (!arr?.length) return null; const s = arr.find(f=>f.visible!==false&&f.type==='SOLID'); return s?.color?hex(s.color.r,s.color.g,s.color.b):null; };

// Deep recursive stroke finder – returns array of { layer, strokeHex, strokeWeight }
function deepStrokes(node, layer=0, acc=[]) {
    if (layer > 5) return acc;
    const s = stroke(node.strokes);
    if (s) acc.push({ name: node.name, type: node.type, strokeHex: s, strokeWeight: node.strokeWeight, fill: fill(node.fills) });
    (node.children||[]).forEach(c => deepStrokes(c, layer+1, acc));
    return acc;
}
// Shadow summarizer
function shadows(node) {
    return (node.effects||[]).filter(e => e.type?.includes('SHADOW')).map(e => ({
        type: e.type, color: e.color ? hex(e.color.r,e.color.g,e.color.b) : null,
        alpha: e.color ? Math.round((e.color.a||1)*100) : null,
        x: e.offset?.x, y: e.offset?.y, blur: e.radius, spread: e.spread,
    }));
}

// Targeted pages (exact match + contains)
const PAGES = {
    'Cards':          { found: false, variants: [] },
    'Input':          { found: false, variants: [] },
    'Adjuntos':       { found: false, variants: [] },
    'Botones':        { found: false, variants: [] },
    'Checkbox':       { found: false, variants: [] },
    'Radio':          { found: false, variants: [] },
    'Switch':         { found: false, variants: [] },
    'Select':         { found: false, variants: [] },
    'Alertas':        { found: false, variants: [] },
    'Badges':         { found: false, variants: [] },
    'Sheet':          { found: false, variants: [] },
    'Tooltip':        { found: false, variants: [] },
};

Object.entries(nodes).forEach(([nodeId, wrapper]) => {
    const m = compMeta[nodeId];
    if (!m?.containing_frame) return;
    const pageName = m.containing_frame.pageName || '';

    const key = Object.keys(PAGES).find(k => pageName.includes(k));
    if (!key) return;
    PAGES[key].found = true;

    const doc = wrapper.document;
    if (!doc) return;

    const bbox = doc.absoluteBoundingBox || {};
    const compSetName = m.containing_frame.containingComponentSet?.name || m.containing_frame.name || '?';

    PAGES[key].variants.push({
        variantName: doc.name,
        compSet: compSetName,
        w: Math.round(bbox.width||0),
        h: Math.round(bbox.height||0),
        fill: fill(doc.fills),
        strokeTop: stroke(doc.strokes),
        strokeWeight: doc.strokeWeight,
        radius: doc.cornerRadius,
        radii: doc.rectangleCornerRadii,
        padT: doc.paddingTop, padR: doc.paddingRight,
        padB: doc.paddingBottom, padL: doc.paddingLeft,
        gap: doc.itemSpacing,
        shadows: shadows(doc),
        deepStrokes: deepStrokes(doc),
        children: (doc.children||[]).slice(0,8).map(c => {
            const cb = c.absoluteBoundingBox||{};
            return {
                name: c.name, type: c.type,
                w: Math.round(cb.width||0), h: Math.round(cb.height||0),
                fill: fill(c.fills), stroke: stroke(c.strokes),
                strokeWeight: c.strokeWeight, radius: c.cornerRadius,
                padT: c.paddingTop, padR: c.paddingRight,
                padB: c.paddingBottom, padL: c.paddingLeft,
                gap: c.itemSpacing,
            };
        }),
    });
});

// ============== OUTPUT ==============
let report = '';

Object.entries(PAGES).forEach(([page, data]) => {
    report += `\n${'='.repeat(60)}\n## ${page.toUpperCase()} (found=${data.found}, variants=${data.variants.length})\n${'='.repeat(60)}\n`;
    if (!data.variants.length) { report += '  <NO DATA>\n'; return; }

    // Group by compSet
    const groups = {};
    data.variants.forEach(v => {
        if (!groups[v.compSet]) groups[v.compSet] = [];
        groups[v.compSet].push(v);
    });

    Object.entries(groups).forEach(([setName, vars]) => {
        report += `\n  ### ${setName} (${vars.length} variants)\n`;
        vars.slice(0, 6).forEach(v => {
            report += `  [${v.variantName}] ${v.w}×${v.h}px\n`;
            report += `    fill=${v.fill||'—'} | border=${v.strokeTop||'Sin borde'} w=${v.strokeWeight||'?'} | radius=${v.radius||'?'}\n`;
            if (v.padT != null) report += `    pad: T=${v.padT} R=${v.padR} B=${v.padB} L=${v.padL} | gap=${v.gap||'?'}\n`;
            if (v.shadows?.length) {
                v.shadows.forEach(s => report += `    SHADOW: ${s.type} ${s.color}@${s.alpha}% x=${s.x} y=${s.y} blur=${s.blur}px spread=${s.spread||0}px\n`);
            }
            if (v.radii) report += `    radii: TL=${v.radii[0]} TR=${v.radii[1]} BR=${v.radii[2]} BL=${v.radii[3]}\n`;
            // Deep strokes (deduplicated)
            const seen = new Set();
            v.deepStrokes.forEach(ds => {
                const key = `${ds.name}|${ds.strokeHex}|${ds.strokeWeight}`;
                if (seen.has(key)) return;
                seen.add(key);
                report += `    > deep-stroke [${ds.name}]: ${ds.strokeHex} w=${ds.strokeWeight}\n`;
            });
            v.children.forEach(c => {
                if (c.fill || c.stroke) {
                    report += `    child [${c.name}] ${c.w}×${c.h} fill=${c.fill||'—'} border=${c.stroke||'—'} w=${c.strokeWeight||'?'} radius=${c.radius||'?'}`;
                    if (c.padT != null) report += ` pad:${c.padT},${c.padR},${c.padB},${c.padL}`;
                    report += '\n';
                }
            });
        });
        if (vars.length > 6) report += `  ... and ${vars.length-6} more variants\n`;
    });
});

fs.writeFileSync(path.join(outDir, 'stroke-audit.md'), report, 'utf8');
console.log('Done! stroke-audit.md written.');
console.log('Total chars:', report.length);
