// ──────────────────────────────────────────────────────────────────────────────
// Tailwind Config Exporter — Fase de Integración (Paso 2.5)
// Genera un parche de configuración para tailwind.config.js basado en
// las variables indexadas del sistema de diseño.
// ──────────────────────────────────────────────────────────────────────────────

'use strict';

const fs     = require('fs');
const path   = require('path');
const { buildVariableMapper } = require('./utils/variable-mapper');

const OUTPUT_FILE = path.join(__dirname, '..', 'tailwind.config.patch.js');

function exportTailwindConfig() {
  console.log('🎨 Tailwind Config Exporter — Iniciando...');

  let mapper;
  try {
    mapper = buildVariableMapper();
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }

  // Helper para limpiar nombres de variables para que sean claves válidas en objetos JS
  const sanitizeKey = (name) => name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const config = {
    theme: {
      extend: {
        colors: {},
        borderRadius: {},
        spacing: {},
        boxShadow: {},
      }
    }
  };

  // 1. Exportar Colores
  console.log(`   🎨 Procesando ${mapper.colorIndex.size} colores...`);
  for (const info of mapper.colorIndex.values()) {
    const key = sanitizeKey(info.varName.replace(/colores de marca\//i, '').replace(/backgounds\//i, 'bg-'));
    config.theme.extend.colors[key] = info.hex;
  }

  // 2. Exportar Redondeados
  console.log(`   📐 Procesando ${mapper.radiusIndex.size} radios...`);
  for (const info of mapper.radiusIndex.values()) {
    const key = sanitizeKey(info.varName);
    config.theme.extend.borderRadius[key] = `${info.px}px`;
  }

  // 3. Exportar Espaciados
  console.log(`   📏 Procesando ${mapper.spacingIndex.size} espaciados...`);
  for (const info of mapper.spacingIndex.values()) {
    const key = sanitizeKey(info.varName);
    config.theme.extend.spacing[key] = `${info.px}px`;
  }

  // 4. Exportar Sombras
  console.log(`   🕯️  Procesando ${mapper.shadowIndex.size} sombras...`);
  for (const info of mapper.shadowIndex.values()) {
    const key = sanitizeKey(info.varName);
    // Usamos el valor de blur para construir una sombra estándar (y=blur/2, blur=blur, spread=0)
    const blur = info.blur;
    const y    = Math.round(blur / 2);
    config.theme.extend.boxShadow[key] = `0 ${y}px ${blur}px rgba(0, 0, 0, 0.1)`;
  }

  // Generar contenido del archivo
  const content = `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: ${JSON.stringify(config.theme.extend, null, 2)}
  }
};

/**
 * NOTA: Copia el contenido de "extend" en tu archivo tailwind.config.js real.
 * Esto habilitará clases como:
 * - bg-[tu-color]
 * - rounded-[su-radio]
 * - p-[su-espaciado]
 */
`;

  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`\n✅ Parche generado en: ${OUTPUT_FILE}`);
}

exportTailwindConfig();
