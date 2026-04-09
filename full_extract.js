const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const allNodesPath = path.join(outputDir, 'deep-nodes', 'all-nodes.json');
const componentsMapPath = path.join(outputDir, 'components-map.json');

const raw = fs.readFileSync(allNodesPath, 'utf8');
const data = JSON.parse(raw);
const nodesMap = data.nodes;

const compMapData = JSON.parse(fs.readFileSync(componentsMapPath, 'utf8'));
const components = compMapData.meta.components;

// Build a lookup from nodeId to component meta
const compMeta = {};
components.forEach(c => {
    compMeta[c.node_id] = c;
});

function rgbToHex(r, g, b) {
    const toH = x => Math.round(x * 255).toString(16).toUpperCase().padStart(2, '0');
    return `#${toH(r)}${toH(g)}${toH(b)}`;
}

function extractFillHex(fills) {
    if (!fills || !fills.length) return null;
    const fill = fills.find(f => f.visible !== false && f.type === 'SOLID');
    if (fill && fill.color) {
        return rgbToHex(fill.color.r, fill.color.g, fill.color.b);
    }
    return null;
}

function describeTextStyle(style) {
    if (!style) return '';
    return `${style.fontFamily || ''} ${style.fontWeight || ''} ${style.fontSize || ''}px`;
}

// Walk all nodes and collect detailed info grouped by page
const pageData = {};

Object.entries(nodesMap).forEach(([nodeId, nodeWrapper]) => {
    const doc = nodeWrapper.document;
    if (!doc) return;
    
    const meta = compMeta[nodeId];
    if (!meta || !meta.containing_frame) return;
    
    const pageName = (meta.containing_frame.pageName || 'Unknown').replace(/[^\w áéíóúÁÉÍÓÚñÑ]/g, '').trim();
    const frameName = meta.containing_frame.name;
    const compSetName = meta.containing_frame.containingComponentSet 
        ? meta.containing_frame.containingComponentSet.name 
        : frameName;
    
    if (!pageData[pageName]) pageData[pageName] = {};
    if (!pageData[pageName][compSetName]) {
        pageData[pageName][compSetName] = {
            variants: [],
            allFills: new Set(),
            allSizes: new Set()
        };
    }
    
    const bbox = doc.absoluteBoundingBox || {};
    const fill = extractFillHex(doc.fills);
    
    pageData[pageName][compSetName].variants.push({
        variantName: doc.name,
        width: Math.round(bbox.width || 0),
        height: Math.round(bbox.height || 0),
        fill: fill,
        paddingTop: doc.paddingTop,
        paddingRight: doc.paddingRight,
        paddingBottom: doc.paddingBottom,
        paddingLeft: doc.paddingLeft,
        gap: doc.itemSpacing,
        cornerRadius: doc.cornerRadius,
        children: doc.children ? doc.children.length : 0,
    });
    
    if (fill) pageData[pageName][compSetName].allFills.add(fill);
    if (bbox.width && bbox.height) {
        pageData[pageName][compSetName].allSizes.add(`${Math.round(bbox.width)}×${Math.round(bbox.height)}`);
    }
});

// Write a structured summary per page
let output = '';

const priority = [
    'Botones', 'Input', 'Checkbox', 'Radiobuttom', 'Select', 'Multiselect', 'Combobox',
    'Text Area', 'Switch', 'Slider', 'Adjuntos',
    'Badges', 'Alertas', 'Alertas de dialogo', 'Tooltip', 'Skeleton', 'Progreso', 'Stepper', 'Notification',
    'Header', 'Menubar', 'Sidebar', 'Miga de pan', 'Tabs', 'Acordeón',
    'Table', 'Paginación',
    'Dialogo', 'Sheet', 'Menú Desplegable',
    'Avatar', 'Scrollbar', 'Logo', 'Logos externos', 'Íconos'
];

const pagesOrdered = priority.filter(p => pageData[p]).concat(
    Object.keys(pageData).filter(p => !priority.includes(p))
);

pagesOrdered.forEach(pageName => {
    const comps = pageData[pageName];
    output += `\n\n## PÁGINA: ${pageName}\n`;
    
    Object.entries(comps).forEach(([compName, compInfo]) => {
        output += `\n### ${compName}\n`;
        
        // Summary of sizes
        const sizes = [...compInfo.allSizes];
        if (sizes.length > 0) {
            output += `**Tamaños detectados:** ${sizes.join(' · ')}\n\n`;
        }
        
        // All unique fills
        const fills = [...compInfo.allFills];
        if (fills.length > 0) {
            output += `**Colores encontrados:** ${fills.join(' · ')}\n\n`;
        }
        
        // Table of variants
        output += `| Variante | W | H | Fondo | Padding (T,R,B,L) | Gap | Radius |\n`;
        output += `|----------|---|---|-------|-------------------|-----|--------|\n`;
        
        // Deduplicate by variant name
        const seen = new Set();
        compInfo.variants.forEach(v => {
            const key = v.variantName;
            if (seen.has(key)) return;
            seen.add(key);
            
            const pad = (v.paddingTop != null) 
                ? `${v.paddingTop}, ${v.paddingRight}, ${v.paddingBottom}, ${v.paddingLeft}` 
                : '—';
            const gap = v.gap != null ? `${v.gap}` : '—';
            const radius = v.cornerRadius != null ? `${v.cornerRadius}px` : '—';
            const fill = v.fill || '—';
            const variantLabel = v.variantName.length > 40 ? v.variantName.substring(0, 40) + '…' : v.variantName;
            
            output += `| \`${variantLabel}\` | ${v.width} | ${v.height} | \`${fill}\` | ${pad} | ${gap} | ${radius} |\n`;
        });
    });
});

fs.writeFileSync(path.join(outputDir, 'extracted-components.md'), output, 'utf8');
console.log("Extraction complete. Pages processed:", pagesOrdered.length);
console.log("Output saved to:", path.join(outputDir, 'extracted-components.md'));
