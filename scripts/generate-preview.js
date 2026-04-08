// ──────────────────────────────────────────────────────────────────────────────
// Preview Page Generator — Fase de Integración (Paso 2.6)
// Crea un archivo .tsx que importa y renderiza los componentes piloto.
// ──────────────────────────────────────────────────────────────────────────────

'use strict';

const fs     = require('fs');
const path   = require('path');

const COMPONENTS_DIR = path.join(__dirname, '..', 'output', 'react-components-smart');
const OUTPUT_FILE    = path.join(__dirname, '..', 'output', 'PreviewPage.tsx');

function generatePreview() {
  console.log('🖼️  Preview Page Generator — Iniciando...');

  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.error(`❌ No existe la carpeta de componentes: ${COMPONENTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(COMPONENTS_DIR).filter(f => f.endsWith('.tsx'));
  const componentNames = files.map(f => f.replace('.tsx', ''));

  console.log(`   📦 Encontrados ${componentNames.length} componentes para la preview.`);

  const imports = componentNames
    .map(name => `import ${name} from './react-components-smart/${name}';`)
    .join('\n');

  const gridItems = componentNames
    .map(name => `
        <div key="${name}" className="border border-gray-200 rounded-xl p-6 flex flex-col items-center gap-4 bg-white shadow-sm">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">${name}</h2>
          <div className="w-full flex justify-center p-8 bg-gray-50 rounded-lg min-h-[200px] items-center">
            <${name} />
          </div>
        </div>`)
    .join('\n');

  const content = `// ────────────────────────────────────────────────────────────
// PreviewPage — Visualizador de Componentes Piloto
// ────────────────────────────────────────────────────────────
// Este archivo agrupa los componentes generados para inspección visual.
// ────────────────────────────────────────────────────────────

import React from 'react';
${imports}

const PreviewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-12 font-sans">
      <header className="mb-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Figma Component Pilot</h1>
        <p className="text-gray-600 italic">Visualización de los primeros ${componentNames.length} componentes generados con Variable Mapping.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${gridItems}
      </div>
      
      <footer className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-400 text-xs">
        Figma Ingestor Bot — Generated Structure
      </footer>
    </div>
  );
};

export default PreviewPage;
`;

  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`✅ Preview Page generada en: ${OUTPUT_FILE}`);
}

generatePreview();
