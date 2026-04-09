const fs = require('fs');
const path = require('path');

const varsPath = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output\\Variables';

function floatToHex(r, g, b) {
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16).toUpperCase();
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const coloresStr = fs.readFileSync(path.join(varsPath, 'Colores.json'), 'utf8');
const coloresData = JSON.parse(coloresStr);

console.log("=== COLORES ===");
coloresData.variables.forEach(v => {
  const name = v.name;
  if(v.valuesByMode['39:0'] /* Light mode */) {
      const c = v.valuesByMode['39:0'];
      if(c.r !== undefined) {
         console.log(`| \`${name}\` | \`${floatToHex(c.r, c.g, c.b)}\` |`);
      }
  }
});

const tipografiaStr = fs.readFileSync(path.join(varsPath, 'Tipografía.json'), 'utf8');
const tipografiaData = JSON.parse(tipografiaStr);
console.log("\n=== TIPOGRAFIA ===");
tipografiaData.variables.forEach(v => {
    const name = v.name;
    const val = v.valuesByMode[Object.keys(v.valuesByMode)[0]];
    console.log(`| \`${name}\` | ${val} |`);
});

const espaciadosStr = fs.readFileSync(path.join(varsPath, 'Espaciados.json'), 'utf8');
const espaciadosData = JSON.parse(espaciadosStr);
console.log("\n=== ESPACIADOS ===");
espaciadosData.variables.forEach(v => {
    const name = v.name;
    const px = v.valuesByMode['34:6'];
    const rem = v.valuesByMode['34:7'];
    console.log(`| \`${name}\` | ${px}px / ${rem}rem |`);
});

const redondeadosStr = fs.readFileSync(path.join(varsPath, 'Redondeados.json'), 'utf8');
const redondeadosData = JSON.parse(redondeadosStr);
console.log("\n=== REDONDEADOS ===");
redondeadosData.variables.forEach(v => {
    const name = v.name;
    const val = v.valuesByMode['37:0'];
    console.log(`| \`${name}\` | ${val}px |`);
});

const sombrasStr = fs.readFileSync(path.join(varsPath, 'Sombras.json'), 'utf8');
const sombrasData = JSON.parse(sombrasStr);
console.log("\n=== SOMBRAS ===");
sombrasData.variables.forEach(v => {
    const name = v.name;
    const val = v.valuesByMode['37:1'];
    console.log(`| \`${name}\` | ${val} (blur?) |`);
});
