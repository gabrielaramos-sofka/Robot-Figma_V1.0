const fs = require('fs');

const mdPath = 'C:\\Users\\GABRIELA RAMOS\\Downloads\\Design System. 18.03.2026.md';
const encyclopediaPath = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output\\encyclopedia-section.md';
const extractedPath = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output\\extracted-components.md';

let mdContent = fs.readFileSync(mdPath, 'utf8');
const encyclopediaContent = fs.readFileSync(encyclopediaPath, 'utf8');

// Find where "## 2. COMPONENTES DE FORMULARIO" starts in the md
const section2Start = mdContent.indexOf('\n## 2. COMPONENTES DE FORMULARIO');
// Find where "## 9. EVALUACIÓN FINAL" starts in the md
const section9Start = mdContent.indexOf('\n## 9. EVALUACIÓN FINAL');

if (section2Start === -1 || section9Start === -1) {
    console.error("Could not find section markers!");
    console.log("Section 2:", section2Start);
    console.log("Section 9:", section9Start);
    process.exit(1);
}

const before = mdContent.substring(0, section2Start); // up to (not including) ## 2.
const after = mdContent.substring(section9Start);     // from ## 9. onwards

// Assemble new content
const newContent = before + '\n' + encyclopediaContent.trim() + '\n\n' + after.trim() + '\n';

fs.writeFileSync(mdPath, newContent, 'utf8');

const lines = newContent.split('\n').length;
const bytes = Buffer.byteLength(newContent, 'utf8');
console.log(`Done! File rebuilt: ${lines} lines, ${bytes} bytes.`);
console.log(`Sections 2-8 replaced with encyclopedic content.`);
