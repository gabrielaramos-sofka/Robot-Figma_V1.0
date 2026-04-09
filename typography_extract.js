/**
 * typography_extract.js
 * Extracts all text style tokens (font-size, line-height, font-weight, font-family)
 * from all-nodes.json grouped by style name pattern (Heading/H1/Large etc.)
 */
const fs   = require('fs');
const path = require('path');

const nodesFile = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output\\deep-nodes\\all-nodes.json';
const compFile  = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output\\components-map.json';
const outFile   = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output\\typography-scale.md';

const { nodes } = JSON.parse(fs.readFileSync(nodesFile, 'utf8'));

// Collect all text styles recursively
const styleMap = {}; // styleName -> { fontSize, lineHeight, fontFamily, fontWeight }

function walkNode(node, depth=0) {
    if (depth > 8) return;
    if (node.type === 'TEXT' || node.type === 'VECTOR') {
        const s = node.style || {};
        if (s.fontSize) {
            const name = node.name || 'unknown';
            const key  = `${s.fontFamily||'?'}|${s.fontWeight||'?'}|${s.fontSize}|${s.lineHeightPx||s.lineHeightUnit}`;
            if (!styleMap[key]) {
                styleMap[key] = {
                    name,
                    fontFamily: s.fontFamily,
                    fontStyle:  s.fontStyle || '',
                    fontWeight: s.fontWeight,
                    fontSize:   s.fontSize,
                    lineHeightPx: s.lineHeightPx ? Math.round(s.lineHeightPx) : null,
                    lineHeightUnit: s.lineHeightUnit,
                    lineHeightValue: s.lineHeightPercentFontSize || s.lineHeightValue,
                    letterSpacing: s.letterSpacing,
                    textAlignHorizontal: s.textAlignHorizontal,
                    count: 0,
                };
            }
            styleMap[key].count++;
        }
    }
    // Also check .textStyle
    if (node.textStyle) {
        const s = node.textStyle;
        if (s.fontSize) {
            const name = node.name || 'unknown';
            const key  = `TS|${s.fontFamily||'?'}|${s.fontWeight||'?'}|${s.fontSize}|${s.lineHeightPx||s.lineHeightUnit}`;
            if (!styleMap[key]) {
                styleMap[key] = {
                    name: 'textStyle:' + name,
                    fontFamily: s.fontFamily,
                    fontStyle:  s.fontStyle || '',
                    fontWeight: s.fontWeight,
                    fontSize:   s.fontSize,
                    lineHeightPx: s.lineHeightPx ? Math.round(s.lineHeightPx) : null,
                    lineHeightUnit: s.lineHeightUnit,
                    lineHeightValue: s.lineHeightPercentFontSize || s.lineHeightValue,
                    letterSpacing: s.letterSpacing,
                    count: 0,
                };
            }
            styleMap[key].count++;
        }
    }
    (node.children || []).forEach(c => walkNode(c, depth+1));
}

console.log('Scanning nodes...');
let nodeCount = 0;
Object.values(nodes).forEach(wrapper => {
    nodeCount++;
    if (wrapper.document) walkNode(wrapper.document);
});
console.log(`Scanned ${nodeCount} top-level nodes.`);

// Also try to look for named text styles in the components-map
const compData = JSON.parse(fs.readFileSync(compFile, 'utf8'));
// Look for textStyles in meta
const textStyles = compData.meta?.styles || [];
console.log(`Found ${textStyles.length} meta styles.`);

// Sort by fontSize desc
const uniqueStyles = Object.values(styleMap)
    .filter(s => s.fontFamily && (s.fontFamily.toLowerCase().includes('axiform') || s.fontFamily.toLowerCase().includes('axiforma')))
    .sort((a,b) => b.fontSize - a.fontSize);

// Also include non-Axiforma ones
const allStyles = Object.values(styleMap).sort((a,b) => b.fontSize - a.fontSize);

let report = `# Typography Scale Extraction\nTotal unique text styles: ${allStyles.length}\n\n`;
report += `## Axiforma styles only (${uniqueStyles.length})\n\n`;
report += `| fontSize | lineHeight | fontWeight | fontStyle | Count | Name (sample) |\n`;
report += `|----------|-----------|------------|-----------|-------|---------------|\n`;
uniqueStyles.forEach(s => {
    const lh = s.lineHeightPx ? `${s.lineHeightPx}px` : (s.lineHeightUnit === 'AUTO' ? 'Auto' : `${s.lineHeightValue}%`);
    report += `| ${s.fontSize}px | ${lh} | ${s.fontWeight} | ${s.fontStyle||'-'} | ${s.count} | ${s.name.slice(0,50)} |\n`;
});

report += `\n## ALL text styles (${allStyles.length})\n\n`;
report += `| fontSize | lineHeight | fontFamily | fontWeight | Count | Name |\n`;
report += `|----------|-----------|------------|------------|-------|------|\n`;
allStyles.forEach(s => {
    const lh = s.lineHeightPx ? `${s.lineHeightPx}px` : (s.lineHeightUnit === 'AUTO' ? 'Auto' : `${s.lineHeightValue}%`);
    report += `| ${s.fontSize}px | ${lh} | ${s.fontFamily} | ${s.fontWeight} | ${s.count} | ${(s.name||'').slice(0,40)} |\n`;
});

// Meta text styles
if (textStyles.length > 0) {
    report += `\n## Meta text styles from components-map\n\n`;
    textStyles.forEach(ts => {
        report += `- ${ts.name}: ${JSON.stringify(ts)}\n`;
    });
}

fs.writeFileSync(outFile, report, 'utf8');
console.log('Done! typography-scale.md written. Lines:', report.split('\n').length);
