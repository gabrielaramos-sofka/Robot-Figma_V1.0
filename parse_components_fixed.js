const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';
const componentsMapPath = path.join(outputDir, 'components-map.json');

const data = JSON.parse(fs.readFileSync(componentsMapPath, 'utf8'));
const components = data.meta && data.meta.components ? data.meta.components : [];

const pages = {};
components.forEach(c => {
    let pageName = 'Unknown Page';
    if (c.containing_frame && c.containing_frame.pageName) {
        pageName = c.containing_frame.pageName.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '').trim();
    }
    
    if (!pages[pageName]) pages[pageName] = new Set();
    
    // Some are inside component sets
    let componentName = c.name;
    if (c.containing_frame && c.containing_frame.containingComponentSet) {
        componentName = c.containing_frame.containingComponentSet.name;
    } else if (c.containing_frame && c.containing_frame.name) {
        componentName = c.containing_frame.name;
    }
    
    pages[pageName].add(componentName);
});

console.log(`Found ${components.length} component variants across ${Object.keys(pages).length} pages.\n`);

for (const page in pages) {
    console.log(`## ${page}`);
    console.log([...pages[page]].map(n => `- ${n}`).join('\n'));
    console.log();
}
