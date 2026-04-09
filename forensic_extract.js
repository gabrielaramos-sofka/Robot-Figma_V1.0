/**
 * Forensic extractor — deep inspection of specific components:
 * Tooltip, Avatar, Accordion, Table, Skeleton, Progress, Pagination,
 * Header, Sidebar, Stepper, Notification, Dialog, Sheet, Tabs
 */
const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const allNodesPath = path.join(outputDir, 'deep-nodes', 'all-nodes.json');
const componentsMapPath = path.join(outputDir, 'components-map.json');

console.log("Loading JSON files...");
const data = JSON.parse(fs.readFileSync(allNodesPath, 'utf8'));
const nodesMap = data.nodes;

const compMapData = JSON.parse(fs.readFileSync(componentsMapPath, 'utf8'));
const components = compMapData.meta.components;

// Build lookup: nodeId -> component meta
const compMeta = {};
components.forEach(c => { compMeta[c.node_id] = c; });

function rgbToHex(r, g, b) {
    const toH = x => Math.round(x * 255).toString(16).toUpperCase().padStart(2, '0');
    return `#${toH(r)}${toH(g)}${toH(b)}`;
}

function extractFills(fills) {
    if (!fills || !fills.length) return [];
    return fills
        .filter(f => f.visible !== false)
        .map(f => {
            if (f.type === 'SOLID' && f.color) {
                return { type: 'solid', hex: rgbToHex(f.color.r, f.color.g, f.color.b), opacity: f.opacity || 1 };
            }
            if (f.type === 'GRADIENT_LINEAR') return { type: 'gradient' };
            return { type: f.type };
        });
}

function extractStrokes(strokes) {
    if (!strokes || !strokes.length) return [];
    return strokes
        .filter(s => s.visible !== false)
        .map(s => {
            if (s.type === 'SOLID' && s.color) {
                return { hex: rgbToHex(s.color.r, s.color.g, s.color.b), weight: null };
            }
            return { hex: null };
        });
}

function getTextStyle(node) {
    if (node.style) {
        return {
            family: node.style.fontFamily,
            weight: node.style.fontWeight,
            size: node.style.fontSize,
            lineHeight: node.style.lineHeightPx,
            letterSpacing: node.style.letterSpacing,
        };
    }
    return null;
}

// Recursively extract text nodes from children
function extractTexts(node, results = []) {
    if (node.type === 'TEXT') {
        const style = getTextStyle(node);
        const fill = node.fills ? extractFills(node.fills) : [];
        results.push({
            name: node.name,
            characters: node.characters ? node.characters.substring(0, 60) : '',
            style,
            fill: fill.length ? fill[0].hex : null,
        });
    }
    if (node.children) node.children.forEach(c => extractTexts(c, results));
    return results;
}

// Full deep inspection of a component node
function deepInspect(nodeId, maxDepth = 4) {
    const wrapper = nodesMap[nodeId];
    if (!wrapper || !wrapper.document) return null;
    
    const doc = wrapper.document;
    
    function inspectNode(n, depth) {
        if (depth > maxDepth) return { name: n.name, type: n.type, truncated: true };
        
        const bbox = n.absoluteBoundingBox || {};
        const fills = extractFills(n.fills);
        const strokes = extractStrokes(n.strokes);
        const textStyle = n.type === 'TEXT' ? getTextStyle(n) : null;
        
        const result = {
            name: n.name,
            type: n.type,
            width: bbox.width ? Math.round(bbox.width) : undefined,
            height: bbox.height ? Math.round(bbox.height) : undefined,
            fills: fills.length ? fills : undefined,
            strokes: strokes.length ? strokes : undefined,
            strokeWeight: n.strokeWeight,
            cornerRadius: n.cornerRadius,
            cornerRadii: n.rectangleCornerRadii,
            paddingTop: n.paddingTop,
            paddingRight: n.paddingRight,
            paddingBottom: n.paddingBottom,
            paddingLeft: n.paddingLeft,
            itemSpacing: n.itemSpacing,
            layoutMode: n.layoutMode,
            primaryAxisAlignItems: n.primaryAxisAlignItems,
            counterAxisAlignItems: n.counterAxisAlignItems,
            opacity: n.opacity !== 1 ? n.opacity : undefined,
            textStyle: textStyle || undefined,
            characters: n.characters ? n.characters.substring(0, 80) : undefined,
        };
        
        // Remove undefined
        Object.keys(result).forEach(k => result[k] === undefined && delete result[k]);
        
        if (n.children) {
            result.children = n.children.map(c => inspectNode(c, depth + 1));
        }
        
        return result;
    }
    
    return inspectNode(doc, 0);
}

// Target pages
const TARGET_PAGES = [
    'Tooltip', 'Avatar', 'Acordeón', 'Table', 'Skeleton', 'Progreso',
    'Paginación', 'Header', 'Sidebar', 'Stepper', 'Notification',
    'Dialogo', 'Sheet', 'Tabs', 'Switch', 'Menubar', 'Miga de pan',
    'Menú Desplegable'
];

// Collect nodes for target pages
const targetNodes = {};
TARGET_PAGES.forEach(p => targetNodes[p] = {});

let processed = 0;
Object.entries(nodesMap).forEach(([nodeId, wrapper]) => {
    const meta = compMeta[nodeId];
    if (!meta || !meta.containing_frame) return;
    
    const pageName = (meta.containing_frame.pageName || '').trim();
    
    // Check if this page is in our targets
    const targetPage = TARGET_PAGES.find(t => pageName.includes(t));
    if (!targetPage) return;
    
    const compSetName = meta.containing_frame.containingComponentSet
        ? meta.containing_frame.containingComponentSet.name
        : meta.containing_frame.name;
    
    if (!targetNodes[targetPage][compSetName]) {
        targetNodes[targetPage][compSetName] = [];
    }
    
    targetNodes[targetPage][compSetName].push({ nodeId, variantName: wrapper.document ? wrapper.document.name : 'unknown' });
    processed++;
});

console.log(`Processed ${processed} nodes for target pages.`);

// Now deep-inspect the FIRST FEW variants of each target component
const results = {};

TARGET_PAGES.forEach(page => {
    results[page] = {};
    const pageComps = targetNodes[page];
    
    Object.entries(pageComps).forEach(([compName, variants]) => {
        // Take first 3 unique variants for deep inspection
        const toInspect = variants.slice(0, 3);
        results[page][compName] = toInspect.map(v => ({
            variantName: v.variantName,
            data: deepInspect(v.nodeId, 3)
        }));
    });
});

// Save results
const outputPath = path.join(outputDir, 'forensic-data.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
console.log("Forensic data saved to:", outputPath);

// Also generate a summary
let summary = '';
TARGET_PAGES.forEach(page => {
    const pageComps = results[page];
    const compCount = Object.keys(pageComps).length;
    if (compCount === 0) {
        summary += `\n## ${page}: NO DATA FOUND\n`;
        return;
    }
    
    summary += `\n## ${page} (${compCount} component sets)\n`;
    
    Object.entries(pageComps).forEach(([compName, variants]) => {
        summary += `\n### ${compName}\n`;
        variants.forEach(v => {
            const d = v.data;
            if (!d) return;
            
            summary += `**Variant:** \`${v.variantName}\`\n`;
            summary += `- Dimensions: ${d.width || '?'}×${d.height || '?'}px\n`;
            if (d.cornerRadius) summary += `- Corner radius: ${d.cornerRadius}px\n`;
            if (d.paddingTop != null) summary += `- Padding: ${d.paddingTop}, ${d.paddingRight}, ${d.paddingBottom}, ${d.paddingLeft}\n`;
            if (d.itemSpacing) summary += `- Gap: ${d.itemSpacing}px\n`;
            if (d.fills && d.fills.length) {
                const solidFill = d.fills.find(f => f.hex);
                if (solidFill) summary += `- Background: \`${solidFill.hex}\`\n`;
            }
            if (d.strokes && d.strokes.length) {
                const solidStroke = d.strokes.find(s => s.hex);
                if (solidStroke) summary += `- Border: \`${solidStroke.hex}\` / weight: ${d.strokeWeight || '?'}px\n`;
            }
            
            // Check children for fills and text
            if (d.children) {
                d.children.forEach(child => {
                    if (child.fills && child.fills.length) {
                        const cf = child.fills.find(f => f.hex);
                        if (cf) summary += `  - Child [${child.name}]: bg=\`${cf.hex}\`\n`;
                    }
                    if (child.strokes && child.strokes.length) {
                        const cs = child.strokes.find(s => s.hex);
                        if (cs) summary += `  - Child [${child.name}]: border=\`${cs.hex}\` w=${child.strokeWeight}\n`;
                    }
                    if (child.type === 'TEXT' && child.textStyle) {
                        summary += `  - Text [${child.name}]: ${child.textStyle.family} ${child.textStyle.weight} ${child.textStyle.size}px\n`;
                    }
                    if (child.width && child.height) {
                        summary += `  - Child [${child.name}]: ${child.width}×${child.height}px radius=${child.cornerRadius || '?'}\n`;
                    }
                });
            }
            
            summary += '\n';
        });
    });
});

fs.writeFileSync(path.join(outputDir, 'forensic-summary.md'), summary, 'utf8');
console.log("Forensic summary saved!");
