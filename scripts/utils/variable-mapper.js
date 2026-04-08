// ──────────────────────────────────────────────────────────────────────────────
// Variable Mapper — Fase de Inteligencia
// Lee todos los JSON en output/Variables/ y construye índices de búsqueda
// para mapear valores Figma → clases Tailwind CSS.
// ──────────────────────────────────────────────────────────────────────────────

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Constantes ────────────────────────────────────────────────────────────────
const VARIABLES_DIR  = path.join(__dirname, '..', '..', 'output', 'Variables');
const LIGHT_MODE_KEY = '39:0';   // Modo Light en Colores.json
const PX_MODE_KEY    = '34:6';   // Modo Píxeles en Espaciados.json
const RADIUS_MODE_KEY = '37:0';  // Único modo en Redondeados.json
const TYPO_MODE_KEY   = '22:0';  // Modo en Tipografía.json
const SHADOW_MODE_KEY = '37:1';  // Modo en Sombras.json

// ── Tabla de mapeo: nombre de variable Figma → clase Tailwind ─────────────────

/**
 * Tailwind v3 border-radius por valor px.
 * Mapea el valor numérico de Figma al utility más cercano.
 */
const RADIUS_TO_TAILWIND = {
  4:   'rounded',       // 4px  ≈ rounded (0.25rem)
  8:   'rounded-lg',    // 8px  ≈ rounded-lg (0.5rem)
  12:  'rounded-xl',    // 12px ≈ rounded-xl (0.75rem)
  20:  'rounded-2xl',   // 20px ≈ rounded-2xl (1.25rem → closest)
  30:  'rounded-3xl',   // 30px ≈ rounded-3xl (1.5rem)
  45:  'rounded-[45px]', // XL — arbitrario
  60:  'rounded-[60px]', // XXL — arbitrario
  999: 'rounded-full',  // Full = pill
};

/**
 * Tailwind v3 spacing por valor px.
 * Los espaciados del sistema siguen el patrón: escala × 8px.
 * Tailwind usa escala-1 = 4px, escala-2 = 8px... → dividimos px/4.
 */
function pxToTailwindSpacing(px) {
  // Tailwind: p-1 = 4px, p-2 = 8px, p-4 = 16px, p-6 = 24px ...
  // La mayoría son divisibles por 4
  const twUnit = px / 4;
  if (Number.isInteger(twUnit) && twUnit <= 96) {
    return `p-${twUnit}`;           // ej: 16px → p-4, 24px → p-6
  }
  return `p-[${px}px]`;             // fallback arbitrario
}

// ── Utilidades de conversión ──────────────────────────────────────────────────

/**
 * Convierte un color Figma {r, g, b, a} (0–1 float) a HEX string (#RRGGBB).
 */
function figmaColorToHex({ r, g, b }) {
  const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Genera un nombre CSS personalizado desde el nombre de la variable Figma.
 * Ej: "Colores de marca/Primario/5" → "--color-primario-5"
 */
function figmaNameToCssVar(name) {
  return '--' + name
    .toLowerCase()
    .replace(/colores de marca\//i,  'color-')
    .replace(/colores semánticos\//i,'semántico-')
    .replace(/black&white\//i,       'bw-')
    .replace(/backgounds\//i,        'bg-')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Constructor del mapa de variables ────────────────────────────────────────

/**
 * Carga y parsea un archivo JSON de Variables con manejo de errores.
 */
function loadVariableFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`  ⚠️  No se pudo leer ${path.basename(filePath)}: ${err.message}`);
    return null;
  }
}

/**
 * Construye el índice de colores: HEX → { varName, cssVar, tailwindArbitrary }
 * Usa el modo Light (39:0) como referencia primaria.
 */
function buildColorIndex(coloresData) {
  const index = new Map();   // hex → info

  for (const variable of (coloresData.variables || [])) {
    if (variable.type !== 'COLOR') continue;

    // Intentar modo Light primero, luego cualquier otro modo disponible
    const modes = variable.resolvedValuesByMode || variable.valuesByMode || {};
    const colorValue = modes[LIGHT_MODE_KEY]?.resolvedValue
                    || Object.values(modes)[0]?.resolvedValue
                    || Object.values(modes)[0];

    if (!colorValue || typeof colorValue.r === 'undefined') continue;

    const hex     = figmaColorToHex(colorValue);
    const cssVar  = figmaNameToCssVar(variable.name);
    const twClass = `bg-[${hex}]`;  // Tailwind arbitrary color class

    // Solo registrar la primera coincidencia (prioridad al color más específico)
    if (!index.has(hex)) {
      index.set(hex, {
        varName    : variable.name,
        figmaId    : variable.id,
        cssVar,
        hex,
        tailwindBg : `bg-[${hex}]`,
        tailwindText: `text-[${hex}]`,
        tailwindBorder: `border-[${hex}]`,
        r: colorValue.r,
        g: colorValue.g,
        b: colorValue.b,
      });
    }
  }

  return index;
}

/**
 * Construye el índice de redondeados: px → { varName, tailwindClass }
 */
function buildRadiusIndex(redondeadosData) {
  const index = new Map();

  for (const variable of (redondeadosData.variables || [])) {
    if (variable.type !== 'FLOAT') continue;

    const modes = variable.resolvedValuesByMode || variable.valuesByMode || {};
    const px    = modes[RADIUS_MODE_KEY]?.resolvedValue
               ?? Object.values(modes)[0]?.resolvedValue
               ?? Object.values(modes)[0];

    if (px === undefined) continue;

    index.set(px, {
      varName      : variable.name,
      figmaId      : variable.id,
      px,
      tailwindClass: RADIUS_TO_TAILWIND[px] || `rounded-[${px}px]`,
    });
  }

  return index;
}

/**
 * Construye el índice de espaciados: px → { varName, tailwindClass }
 */
function buildSpacingIndex(espaciadosData) {
  const index = new Map();

  for (const variable of (espaciadosData.variables || [])) {
    if (variable.type !== 'FLOAT') continue;

    const modes = variable.resolvedValuesByMode || variable.valuesByMode || {};
    const px    = modes[PX_MODE_KEY]?.resolvedValue
               ?? Object.values(modes)[0]?.resolvedValue
               ?? Object.values(modes)[0];

    if (px === undefined) continue;

    index.set(px, {
      varName      : variable.name,
      figmaId      : variable.id,
      px,
      tailwindClass: pxToTailwindSpacing(px),
    });
  }

  return index;
}

/**
 * Mapeo de nombres de grosor a valores numéricos de CSS.
 */
const WEIGHT_MAP = {
  'Bold': '700',
  'Medium': '500',
  'Regular': '400',
  // etc...
};

/**
 * Construye el índice de tipografía: Nombre → { value, type }
 */
function buildTypographyIndex(typoData) {
  const index = new Map();

  for (const variable of (typoData.variables || [])) {
    // En el JSON actual la tipografía es STRING ( Familia y Grosor )
    if (variable.type !== 'STRING' && variable.type !== 'FLOAT') continue;

    const modes = variable.resolvedValuesByMode || variable.valuesByMode || {};
    const val   = modes[TYPO_MODE_KEY]?.resolvedValue
               ?? Object.values(modes)[0]?.resolvedValue
               ?? Object.values(modes)[0];

    if (val === undefined) continue;

    index.set(variable.name, {
      varName: variable.name,
      figmaId: variable.id,
      value: val,
      type: variable.type
    });
  }

  return index;
}

/**
 * Construye el índice de sombras: Blur (FLOAT) → { varName, tailwindClass }
 * En Figma Variables de este set, el valor es el blur (8, 12, 16...).
 */
function buildShadowIndex(sombrasData) {
  const index = new Map();

  for (const variable of (sombrasData.variables || [])) {
    if (variable.type !== 'FLOAT') continue;

    const modes = variable.resolvedValuesByMode || variable.valuesByMode || {};
    const blur  = modes[SHADOW_MODE_KEY]?.resolvedValue
               ?? Object.values(modes)[0]?.resolvedValue
               ?? Object.values(modes)[0];

    if (blur === undefined) continue;

    const key = blur; // Usamos el valor de blur como clave de búsqueda
    index.set(key, {
      varName      : variable.name,
      figmaId      : variable.id,
      blur,
      tailwindClass: `shadow-${variable.name.toLowerCase().replace(/\s+/g, '-')}`,
    });
  }

  return index;
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Carga e indexa todas las variables disponibles.
 * Retorna un objeto con funciones de búsqueda y los índices crudos.
 */
function buildVariableMapper() {
  if (!fs.existsSync(VARIABLES_DIR)) {
    throw new Error(`Carpeta de variables no encontrada: ${VARIABLES_DIR}`);
  }

  const files = fs.readdirSync(VARIABLES_DIR).filter(f => f.endsWith('.json'));
  console.log(`🗃️  Variable Mapper — Cargando ${files.length} archivos de variables...`);

  // Cargar todos los archivos
  const allData = {};
  for (const file of files) {
    const data = loadVariableFile(path.join(VARIABLES_DIR, file));
    if (data) {
      allData[data.name] = data;
      console.log(`   ✓ ${file} (${(data.variables || []).length} variables)`);
    }
  }

  // Construir índices
  const colorIndex  = allData['Colores']      ? buildColorIndex(allData['Colores'])           : new Map();
  const radiusIndex = allData['Redondeados']  ? buildRadiusIndex(allData['Redondeados'])       : new Map();
  const spacingIndex= allData['Espaciados']   ? buildSpacingIndex(allData['Espaciados'])       : new Map();
  const typoIndex   = allData['Tipografía']   ? buildTypographyIndex(allData['Tipografía'])   : new Map();
  const shadowIndex  = allData['Sombras']      ? buildShadowIndex(allData['Sombras'])          : new Map();

  console.log(`   📊 Índices: ${colorIndex.size} colores | ${radiusIndex.size} radios | ${spacingIndex.size} espaciados | ${typoIndex.size} tipografías | ${shadowIndex.size} sombras`);

  return {
    // ── Búsqueda de color ───────────────────────────────────────────────────
    /**
     * Busca un color Figma {r,g,b,a} (0-1) en el catálogo de variables.
     * @returns {Object|null} Info de la variable si hay match, null si no.
     */
    findColor(figmaColor) {
      if (!figmaColor || typeof figmaColor.r === 'undefined') return null;
      const hex = figmaColorToHex(figmaColor);
      return colorIndex.get(hex) || null;
    },

    /**
     * Busca un color por HEX string (#RRGGBB).
     */
    findColorByHex(hex) {
      return colorIndex.get(hex.toUpperCase()) || null;
    },

    // ── Búsqueda de border-radius ───────────────────────────────────────────
    /**
     * Busca un valor de border-radius en px.
     * @returns {Object|null}
     */
    findRadius(px) {
      const rounded = Math.round(px);
      return radiusIndex.get(rounded) || null;
    },

    // ── Búsqueda de espaciado ───────────────────────────────────────────────
    /**
     * Busca un valor de espaciado en px.
     * @returns {Object|null}
     */
    findSpacing(px) {
      const rounded = Math.round(px);
      return spacingIndex.get(rounded) || null;
    },

    // ── Búsqueda de tipografía ──────────────────────────────────────────────
    /**
     * Intenta encontrar una clase Tailwind basada en el nombre de la variable de estilo.
     */
    findTypographyClass(figmaStyleName) {
      // Búsqueda simple por nombre exacto o prefijo
      const entry = typoIndex.get(figmaStyleName);
      if (entry) {
        if (figmaStyleName.includes('fontSize')) return `text-[${entry.value}px]`;
        if (figmaStyleName.includes('fontWeight')) return `font-[${entry.value}]`;
        if (figmaStyleName.includes('lineHeight')) return `leading-[${entry.value}px]`;
      }
      return null;
    },

    // ── Búsqueda de sombras ────────────────────────────────────────────────
    /**
     * Busca una sombra por su valor de blur.
     */
    findShadow(blurValue) {
      if (blurValue === undefined || blurValue === null) return null;
      return shadowIndex.get(blurValue) || null;
    },

    // ── Utilidades de conversión directa ────────────────────────────────────
    figmaColorToHex,
    pxToTailwindSpacing,

    // ── Índices crudos (para uso avanzado) ──────────────────────────────────
    colorIndex,
    radiusIndex,
    spacingIndex,
    typoIndex,
    shadowIndex,
    allData,
  };
}

module.exports = { buildVariableMapper, figmaColorToHex, pxToTailwindSpacing };
