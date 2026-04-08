require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ── Configuración ────────────────────────────────────────────────────────────
const COMPONENTS_MAP = path.join(__dirname, '../output/components-map.json');
const DEEP_NODES = path.join(__dirname, '../output/deep-nodes/all-nodes.json');

// Helper: PascalCase
function toPascalCase(str) {
  if (!str) return 'Component';
  return str
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function resolveDisplayName(comp) {
  if (comp.componentSet && comp.componentSet.name) {
    return comp.componentSet.name;
  }
  return comp.name;
}

// Filtros QA removidos a petición del usuario para volcado masivo bruto

/**
 * Cuenta recursivamente el total de nodos (descendientes).
 */
function countNodes(node) {
  let count = 1;
  if (node.children) {
    node.children.forEach(child => {
      count += countNodes(child);
    });
  }
  return count;
}

/**
 * Verifica recursivamente si el nodo contine texto real (no vacío).
 */
function hasTextNodes(node) {
  if (node.type === 'TEXT') {
    const text = (node.characters || '').trim();
    return text.length > 0;
  }
  if (node.children) {
    return node.children.some(child => hasTextNodes(child));
  }
  return false;
}

// ── Motor de Deep Fetch ───────────────────────────────────────────────────────
const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchSingleBatch(batchIds, batchNum, totalBatches) {
  const ids = batchIds.join(',');
  const url = `https://api.figma.com/v1/files/${process.env.FIGMA_FILE_ID}/nodes?ids=${encodeURIComponent(ids)}`;
  
  let success = false;
  let retries = 0;
  
  while (!success && retries < 10) {
    try {
      console.log(`  ⏳ Batch ${batchNum}/${totalBatches}...`);
      const response = await axios.get(url, {
        headers: { 'X-Figma-Token': process.env.FIGMA_API_TOKEN },
        timeout: 90000
      });
      
      await delay(2500); // Cortesía técnica de 2.5s
      return response.data.nodes || {};
    } catch (err) {
      if (err.response && err.response.status === 429) {
        retries++;
        console.warn(`  ⚠️ Rate Limit (429) en Batch ${batchNum}. Esperando 30 segundos (Reintento ${retries}/10)...`);
        await delay(30000);
      } else {
        console.error(`  ❌ Error fatal en Batch ${batchNum}:`, err.message);
        throw err;
      }
    }
  }
  return {};
}

async function deepFetch() {
  console.log('🔬 Deep Fetch — Fase de QA Piloto (Lote de 50 Especial)');
  
  if (!fs.existsSync(COMPONENTS_MAP)) {
    console.error('❌ No se encontró components-map.json. Ejecuta ingestor primero.');
    process.exit(1);
  }

  const { meta: { components: allComponents } } = JSON.parse(fs.readFileSync(COMPONENTS_MAP, 'utf-8'));
  console.log(`ℹ️  Total de componentes: ${allComponents.length}`);

  const candidates = [];

  for (const comp of allComponents) {
    // Generar nombres únicos reales para soportar los 8000+ (Evitar sobrescritura de TSX)
    let rawName = resolveDisplayName(comp);
    if (comp.componentSet && comp.name) {
      rawName += ' ' + comp.name;
    }
    const pascalName = toPascalCase(rawName);
    
    // ZERO FILTROS - Añadido directo a la cola
    candidates.push({ comp, pascalName });
  }

  console.log(`ℹ️  Candidatos Brutos Extraídos: ${candidates.length}`);

  // 1. CARGAR CACHÉ PREVIA PARA REANUDACIÓN
  let resultNodes = {};
  if (fs.existsSync(DEEP_NODES)) {
    try {
      const cacheData = JSON.parse(fs.readFileSync(DEEP_NODES, 'utf-8'));
      resultNodes = cacheData.nodes || {};
      const cacheSize = Object.keys(resultNodes).length;
      if (cacheSize > 0) {
        console.log(`♻️  Caché detectada: ${cacheSize} nodos ya estaban descargados. Omitiendo su fetch...`);
      }
    } catch(e) {
      console.error('  ⚠️ Error leyendo caché previa. Se iniciará de cero.');
    }
  }

  // 2. FILTRAR LOS YA DESCARGADOS
  const pendingCandidates = candidates.filter(item => !resultNodes[item.comp.node_id]);
  const nodeIds = pendingCandidates.map(p => p.comp.node_id);

  if (nodeIds.length === 0) {
    console.log(`✅ ¡Todos los ${candidates.length} nodos ya están descargados! Ejecuta "npm run generate:react"`);
    return;
  }
  
  console.log(`⏳ Consultando API /nodes para ${nodeIds.length} candidatos faltantes...`);
  
  try {
    const batchSize = 100;
    const totalBatches = Math.ceil(nodeIds.length / batchSize);
    
    for (let i = 0; i < nodeIds.length; i += batchSize) {
      const batchIds = nodeIds.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      
      const batchMap = await fetchSingleBatch(batchIds, batchNum, totalBatches);
      
      // Procesar e integrar inmediatamente a resultNodes
      for (const item of pendingCandidates) {
        if (!batchIds.includes(item.comp.node_id)) continue;
        const nodeData = batchMap[item.comp.node_id]?.document;
        if (!nodeData) continue;
        
        resultNodes[item.comp.node_id] = {
          document: nodeData,
          pascalName: item.pascalName,
          complexity: countNodes(nodeData)
        };
      }
      
      // Guardado Progresivo Seguro (Savepoint)
      if (!fs.existsSync(path.dirname(DEEP_NODES))) {
        fs.mkdirSync(path.dirname(DEEP_NODES), { recursive: true });
      }
      fs.writeFileSync(DEEP_NODES, JSON.stringify({ nodes: resultNodes }, null, 2));
      console.log(`  💾 Progreso guardado progresivamente. (${Object.keys(resultNodes).length}/${candidates.length})`);
    }

    console.log(`✅ Extracción masiva completada exitosamente.`);

  } catch (err) {
    console.error('❌ Error en deep fetch QA:', err.message);
    process.exit(1);
  }
}

deepFetch();
