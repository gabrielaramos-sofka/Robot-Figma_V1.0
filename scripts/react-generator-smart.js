// ──────────────────────────────────────────────────────────────────────────────
// React Generator Smart — Fase de Generación (Paso 2.3)
// Lee output/deep-nodes/pilot-nodes.json y genera .tsx con clases Tailwind
// basadas en las variables del sistema de diseño real.
// ──────────────────────────────────────────────────────────────────────────────

'use strict';

const fs     = require('fs');
const path   = require('path');
const { buildVariableMapper } = require('./utils/variable-mapper');

// ── Configuración ─────────────────────────────────────────────────────────────
const INPUT_FILE  = path.join(__dirname, '..', 'output', 'deep-nodes', 'pilot-nodes.json');
const OUTPUT_DIR  = path.join(__dirname, '..', 'output', 'react-components-smart');

// ── Mapeos de Alineación ───────────────────────────────────────────────────────
const MAPPING_JUSTIFY = {
  'MIN': 'justify-start',
  'CENTER': 'justify-center',
  'MAX': 'justify-end',
  'SPACE_BETWEEN': 'justify-between',
};

const MAPPING_ITEMS = {
  'MIN': 'items-start',
  'CENTER': 'items-center',
  'MAX': 'items-end',
};

// ── Generador de TSX con clases Tailwind ─────────────────────────────────────

/**
 * Resuelve las clases Tailwind para un componente, usando el mapper de variables.
 */
function resolveTailwindClasses(node, mapper) {
  const cssProps = extractCssPropsFromNode(node);
  const classes = [];
  const isText = node.type === 'TEXT';

  // REGLA DE ORO: Si es un nodo de texto, manejamos sus estilos en su propia sección.
  if (isText) return { classes: [], cssProps };

  // ── Layout Mode (Flexbox) ──────────────────────────────────────────────────
  if (node.layoutMode) {
    classes.push('flex');
    classes.push(node.layoutMode === 'VERTICAL' ? 'flex-col' : 'flex-row');

    // Gap (itemSpacing)
    if (cssProps.itemSpacing && cssProps.itemSpacing > 0) {
      classes.push(`gap-[${Math.round(cssProps.itemSpacing)}px]`);
    }

    // Alineación (Afecta a hijos)
    const isVertical = node.layoutMode === 'VERTICAL';
    const alignMap = { 'MIN': 'start', 'CENTER': 'center', 'MAX': 'end', 'SPACE_BETWEEN': 'between' };
    
    // Parche: Forzar items-center en layouts horizontales con espaciado (típico de breadcrumbs/inputs)
    if (!isVertical && cssProps.itemSpacing > 0) {
      classes.push('items-center');
    }

    if (node.primaryAxisAlignItems && alignMap[node.primaryAxisAlignItems]) {
        const val = alignMap[node.primaryAxisAlignItems];
        classes.push(`justify-${val}`);
    }
    
    // Solo aplicar counterAxis si no lo forzamos arriba (o si no es el forzado)
    if (node.counterAxisAlignItems && alignMap[node.counterAxisAlignItems]) {
        const val = alignMap[node.counterAxisAlignItems];
        const classToAdd = `items-${val}`;
        if (!classes.includes(classToAdd)) classes.push(classToAdd);
    } else if (isVertical) {
        // Default para vertical si no hay counterAxis definido? usualmente start
        // classes.push('items-start');
    }
  }

  // ── Paddings individualizados ──────────────────────────────────────────────
  // Usamos Math.round para evitar decimales en clases de Tailwind
  if (cssProps.pt > 0) classes.push(`pt-[${Math.round(cssProps.pt)}px]`);
  if (cssProps.pr > 0) classes.push(`pr-[${Math.round(cssProps.pr)}px]`);
  if (cssProps.pb > 0) classes.push(`pb-[${Math.round(cssProps.pb)}px]`);
  if (cssProps.pl > 0) classes.push(`pl-[${Math.round(cssProps.pl)}px]`);

  // ── Color de fondo ─────────────────────────────────────────────────────────
  if (cssProps.backgroundColor) {
    const match = mapper.findColor(cssProps.backgroundColor);
    if (match) {
      classes.push(match.tailwindBg);
    } else {
      const hex = mapper.figmaColorToHex(cssProps.backgroundColor);
      classes.push(`bg-[${hex}]`);
    }
  }

  // ── Bordes (Strokes) ───────────────────────────────────────────────────────
  if (cssProps.strokeWeight > 0 && cssProps.strokeColor) {
    classes.push('border');
    if (cssProps.strokeWeight !== 1) {
      classes.push(`border-[${Math.round(cssProps.strokeWeight)}px]`);
    }
    
    const match = mapper.findColor(cssProps.strokeColor);
    if (match) {
      classes.push(match.tailwindBorder || match.tailwindBg.replace('bg-', 'border-'));
    } else {
      const hex = mapper.figmaColorToHex(cssProps.strokeColor);
      classes.push(`border-[${hex}]`);
    }
  }

  // ── Border Radius ──────────────────────────────────────────────────────────
  if (cssProps.borderRadius > 0) {
    classes.push(`rounded-[${Math.round(cssProps.borderRadius)}px]`);
  }

  // ── Sombras ──────────────────────────────────────────────────────────────
  if (cssProps.shadowBlur > 0) {
    const match = mapper.findShadow(cssProps.shadowBlur);
    if (match) classes.push(match.tailwindClass);
  }

  // ── Sizing (Ancho y Alto) ────────────────────────────────────────────────
  // Horizontal
  if (node.layoutSizingHorizontal === 'FILL') {
    classes.push('w-full');
  } else if (node.layoutSizingHorizontal === 'HUG') {
    classes.push('w-fit');
  } else if (typeof cssProps.width === 'number') {
    classes.push(`w-[${Math.round(cssProps.width)}px]`);
  }

  // Vertical
  if (node.layoutSizingVertical === 'FILL') {
    classes.push('h-full');
  } else if (node.layoutSizingVertical === 'HUG') {
    classes.push('h-fit');
  } else if (typeof cssProps.height === 'number') {
    classes.push(`h-[${Math.round(cssProps.height)}px]`);
  }

  return { classes, cssProps };
}

/**
 * Renderiza un nodo de Figma y sus hijos recursivamente a un string de TSX.
 */
function renderNode(node, mapper, depth = 0) {
  if (!node) return '';
  const indent = '  '.repeat(depth);
  const isText = node.type === 'TEXT';

  if (isText) {
    const textContent = (node.characters || '').trim();
    if (!textContent) return '';

    const textStyles = [];
    if (node.style) {
      if (node.style.fontSize) textStyles.push(`text-[${node.style.fontSize}px]`);
      if (node.style.fontWeight) {
         const weightMap = { 400: 'normal', 500: 'medium', 600: 'semibold', 700: 'bold' };
         textStyles.push(`font-${weightMap[node.style.fontWeight] || 'normal'}`);
      }
      if (node.style.textAlignHorizontal) {
          const alignMap = { 'LEFT': 'text-left', 'CENTER': 'text-center', 'RIGHT': 'text-right', 'JUSTIFIED': 'text-justify' };
          textStyles.push(alignMap[node.style.textAlignHorizontal] || 'text-left');
      }
    }
    
    // Color de texto
    const solidFill = (node.fills || []).find(f => f.type === 'SOLID' && f.visible !== false);
    if (solidFill) {
       const match = mapper.findColor(solidFill.color);
       textStyles.push(match ? match.tailwindText : `text-[${mapper.figmaColorToHex(solidFill.color)}]`);
    }

    if (node.layoutAlign === 'STRETCH' || node.layoutSizingHorizontal === 'FILL') {
        textStyles.push('w-full');
    }

    return `${indent}<span className="${textStyles.filter(Boolean).join(' ')}">${textContent}</span>`;
  }

  // 3. Manejar nodos de tipo VECTOR (Iconos) — Placeholder elegante (Skeleton Loader)
  if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION' || node.type === 'REGULAR_POLYGON' || node.type === 'ELLIPSE' || node.type === 'STAR') {
    const w = Math.round(node.absoluteBoundingBox?.width || 20);
    const h = Math.round(node.absoluteBoundingBox?.height || 20);
    // Cambiamos el texto [SVG] por un círculo gris limpio
    return `${indent}<div className="w-[${w}px] h-[${h}px] bg-gray-200 rounded-full flex-shrink-0" />`;
  }

  // 4. Manejar nodos CONTENEDORES
  const { classes } = resolveTailwindClasses(node, mapper);

  const childrenTsx = (node.children || [])
    .map(child => renderNode(child, mapper, depth + 1))
    .filter(Boolean)
    .join('\n');

  const finalClass = classes.join(' ').trim() || 'relative';

  if (!childrenTsx) {
    if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.fills?.length > 0 || node.strokes?.length > 0) {
        return `${indent}<div className="${finalClass}" />`;
    }
    return '';
  }

  return `${indent}<div className="${finalClass}">\n${childrenTsx}\n${indent}</div>`;
}

function extractCssPropsFromNode(doc) {
  const props = {
    backgroundColor: null, borderRadius: null, pt: null, pr: null,
    pb: null, pl: null, itemSpacing: null, shadowBlur: null,
    width: null, height: null, primaryAxisAlignItems: null, counterAxisAlignItems: null,
    strokeWeight: null, strokeColor: null
  };

  const fills = doc.fills || [];
  const solidFill = fills.find(f => f.type === 'SOLID' && f.visible !== false);
  if (solidFill?.color) props.backgroundColor = solidFill.color;

  const strokes = doc.strokes || [];
  const solidStroke = strokes.find(s => s.type === 'SOLID' && s.visible !== false);
  if (solidStroke?.color) props.strokeColor = solidStroke.color;
  if (typeof doc.strokeWeight === 'number') props.strokeWeight = doc.strokeWeight;

  if (typeof doc.cornerRadius === 'number') props.borderRadius = doc.cornerRadius;
  if (typeof doc.paddingTop === 'number') props.pt = doc.paddingTop;
  if (typeof doc.paddingRight === 'number') props.pr = doc.paddingRight;
  if (typeof doc.paddingBottom === 'number') props.pb = doc.paddingBottom;
  if (typeof doc.paddingLeft === 'number') props.pl = doc.paddingLeft;
  if (typeof doc.itemSpacing === 'number') props.itemSpacing = doc.itemSpacing;
  
  if (doc.absoluteBoundingBox) {
    props.width = doc.absoluteBoundingBox.width;
    props.height = doc.absoluteBoundingBox.height;
  }

  const effects = doc.effects || [];
  const dropShadow = effects.find(e => e.type === 'DROP_SHADOW' && e.visible !== false);
  if (dropShadow) props.shadowBlur = dropShadow.radius;

  if (doc.primaryAxisAlignItems) props.primaryAxisAlignItems = doc.primaryAxisAlignItems;
  if (doc.counterAxisAlignItems) props.counterAxisAlignItems = doc.counterAxisAlignItems;

  return props;
}

function generateSmartTsx({ pascalName, meta, doc, mapper }) {
  // Usamos depth 2 para que el primer nivel tenga 4 espacios de indentación dentro del return (
  const content = renderNode(doc, mapper, 2);

  return `import React from 'react';

/**
 * Componente: ${pascalName}
 * Nodo Figma: ${meta.nodeId}
 */
export const ${pascalName} = () => {
  return (
${content}
  );
};

export default ${pascalName};
`;
}

function cleanOutputDir(dir) {
  if (fs.existsSync(dir)) {
    console.log(`🧹 Limpiando directorio de salida: ${dir}`);
    fs.readdirSync(dir).forEach(file => {
      fs.unlinkSync(path.join(dir, file));
    });
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Verifica recursivamente si un nodo contiene al menos un nodo de tipo TEXT con contenido.
 */
function hasTextContent(node) {
  if (node.type === 'TEXT') {
    return (node.characters || '').trim().length > 0;
  }
  if (node.children && node.children.length > 0) {
    return node.children.some(child => hasTextContent(child));
  }
  return false;
}

function generateSmartComponents() {
  console.log('⚛️  React Generator Smart — Overwriting & Cleaning Zombies...');

  const mapper = buildVariableMapper();
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ No se encontró pilot-nodes.json');
    process.exit(1);
  }

  // Limpiar antes de generar para evitar componentes antiguos (zombies)
  cleanOutputDir(OUTPUT_DIR);

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const nodes = data.nodes || {}; 
  
  const componentNames = Object.keys(nodes);
  let generatedCount = 0;

  for (const nodeId of componentNames) {
    const nodeWrapper = nodes[nodeId]; // wrapper con .document y .pascalName
    const doc = nodeWrapper.document;
    const pascalName = nodeWrapper.pascalName || (doc.name || 'Component').replace(/[^a-zA-Z0-9]/g, '');
    
    // FILTRO DE TEXTO OBLIGATORIO (Pixel Perfect Rule)
    if (!hasTextContent(doc)) {
      console.log(`  ⚠️  Saltando ${pascalName} (no tiene nodos de texto)`);
      continue;
    }

    console.log(`  ⚛️  Generando → ${pascalName}.tsx`);

    const tsxContent = generateSmartTsx({
      pascalName,
      meta: { figmaKey: doc.id, nodeId: nodeId },
      doc: doc,
      mapper,
    });

    fs.writeFileSync(path.join(OUTPUT_DIR, `${pascalName}.tsx`), tsxContent, 'utf-8');
    generatedCount++;
  }

  console.log(`\n🏁 Generación completada. ${generatedCount} componentes creados. Zombies eliminados.`);
}

generateSmartComponents();
