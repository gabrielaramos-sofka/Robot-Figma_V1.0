// ──────────────────────────────────────────────────────────────────────────────
// Figma API Ingestor — Motor Central
// Paso 2.1: Descarga el mapa de componentes desde la API oficial de Figma
// ──────────────────────────────────────────────────────────────────────────────

'use strict';

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ── 1. Validación de variables de entorno ─────────────────────────────────────
const { FIGMA_API_TOKEN, FIGMA_FILE_ID } = process.env; const PILOT_BATCH_SIZE = 5;  // ← cambia a 50, 500 o Infinity


if (!FIGMA_API_TOKEN || !FIGMA_FILE_ID) {
  console.error('\n❌ ERROR: Faltan variables de entorno requeridas.');
  console.error('   Por favor, copia ".env.example" a ".env" y completa los valores:');
  console.error('     FIGMA_API_TOKEN=<tu token personal de Figma>');
  console.error('     FIGMA_FILE_ID=<el ID del archivo Figma>');
  console.error('\n   Puedes obtener tu token en: Figma → Account Settings → Personal Access Tokens\n');
  process.exit(1);
}

// ── 2. Configuración ─────────────────────────────────────────────────────────
const FIGMA_API_URL = `https://api.figma.com/v1/files/${FIGMA_FILE_ID}/components`;
const OUTPUT_DIR = path.join(__dirname, '..', 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'components-map.json');

// ── 3. Motor de ingesta ───────────────────────────────────────────────────────
async function ingestFigmaComponents() {
  console.log('🚀 Figma Ingestor Bot — Iniciando...');
  console.log(`   📄 File ID  : ${FIGMA_FILE_ID}`);
  console.log(`   🌐 Endpoint : ${FIGMA_API_URL}`);
  console.log('');

  try {
    // Petición a la API de Figma
    console.log('⏳ Conectando con la API de Figma...');
    const response = await axios.get(FIGMA_API_URL, {
      headers: {
        'X-Figma-Token': FIGMA_API_TOKEN,
      },
    });

    const data = response.data;
    const componentCount = data.meta?.components?.length ?? 'desconocido';

    console.log(`✅ Conexión exitosa. Componentes encontrados: ${componentCount}`);

    // Crear carpeta output si no existe
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log('📁 Carpeta "output" creada.');
    }

    // Guardar el JSON con formato legible
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n💾 Mapa de componentes guardado en: ${OUTPUT_FILE}`);
    console.log('\n🏁 ¡Proceso completado exitosamente!\n');

  } catch (error) {
    // Manejo de errores de Axios (HTTP) vs errores de red
    if (error.response) {
      const { status, statusText } = error.response;

      console.error(`\n❌ Error HTTP ${status}: ${statusText}`);

      if (status === 403) {
        console.error('   🔑 Acceso denegado. Verifica que tu FIGMA_API_TOKEN sea válido y tenga permisos.');
      } else if (status === 404) {
        console.error('   🔍 Archivo no encontrado. Verifica que tu FIGMA_FILE_ID sea correcto.');
        console.error('      El ID está en la URL del archivo: figma.com/file/AQUI_VA_EL_ID/...');
      } else if (status === 429) {
        console.error('   ⏱️  Límite de peticiones alcanzado (Rate Limit). Espera un momento e intenta de nuevo.');
      } else {
        console.error(`   Respuesta de Figma: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } else if (error.request) {
      console.error('\n❌ Error de red: No se pudo conectar con la API de Figma.');
      console.error('   Verifica tu conexión a internet.');
    } else {
      console.error('\n❌ Error inesperado:', error.message);
    }

    console.error('\n🛑 El proceso terminó con errores.\n');
    process.exit(1);
  }
}

// ── 4. Arranque ───────────────────────────────────────────────────────────────
ingestFigmaComponents();
