// ──────────────────────────────────────────────────────────────────────────────
// React Generator — Fase de Generación Real (Recursive Engine)
// Lee output/deep-nodes/pilot-nodes.json y genera .tsx con clases Tailwind
// basadas en las variables del sistema de diseño real.
// ──────────────────────────────────────────────────────────────────────────────

'use strict';

const fs     = require('fs');
const path   = require('path');
const { buildVariableMapper } = require('./utils/variable-mapper');

// ── Configuración ─────────────────────────────────────────────────────────────
// IMPORTANTE: Este archivo requiere que existan los nodos profundos (deep-fetch).
const INPUT_FILE  = path.join(__dirname, '..', 'output', 'deep-nodes', 'all-nodes.json');
const OUTPUT_DIR  = path.join(__dirname, '..', 'output', 'react-components');

/**
 * Resuelve las clases Tailwind para un componente, usando el mapper de variables.
 */
function resolveTailwindClasses(node, mapper, parentNode = null) {
  const cssProps = extractCssPropsFromNode(node);
  const classes = [];
  const isText = node.type === 'TEXT';

  if (isText) return { classes: [], cssProps };

  // ── Layout Mode (Flexbox) ──────────────────────────────────────────────────
  if (node.layoutMode) {
    classes.push('flex');
    if (node.layoutMode === 'VERTICAL') classes.push('flex-col');
    if (node.layoutMode === 'HORIZONTAL') classes.push('flex-row');

    if (cssProps.itemSpacing && cssProps.itemSpacing > 0) {
      const g = Math.round(cssProps.itemSpacing);
      // REGLA: Capar gaps gigantes (QA Fix)
      if (g > 24) classes.push('gap-6'); 
      else classes.push(`gap-[${g}px]`);
    }

    // Alineación inteligente & Flex-Wrap (QA Fix)
    const isVertical = node.layoutMode === 'VERTICAL';
    if (!isVertical) {
      classes.push('items-center');
      classes.push('flex-wrap'); // Evitar que los elementos se aplasten
    }

    const alignMap = { 'MIN': 'start', 'CENTER': 'center', 'MAX': 'end', 'SPACE_BETWEEN': 'between' };
    
    if (node.primaryAxisAlignItems && alignMap[node.primaryAxisAlignItems]) {
        const val = alignMap[node.primaryAxisAlignItems];
        classes.push(`justify-${val}`);
    }
    
    if (node.counterAxisAlignItems && alignMap[node.counterAxisAlignItems]) {
        const val = alignMap[node.counterAxisAlignItems];
        const classToAdd = `items-${val}`;
        if (!classes.includes(classToAdd)) {
            const genericIdx = classes.indexOf('items-center');
            if (genericIdx > -1 && val !== 'center') classes.splice(genericIdx, 1);
            classes.push(classToAdd);
        }
    }
  } else {
    // ── REGLA: Posicionamiento Absoluto (Fix Real) ──────────────────────────
    // Si no tiene Auto Layout, el contenedor DEBE ser relative.
    classes.push('relative');
  }

  // ── Paddings ──────────────────────────────────────────────────────────────
  if (cssProps.pt > 0) classes.push(`pt-[${Math.round(cssProps.pt)}px]`);
  if (cssProps.pr > 0) classes.push(`pr-[${Math.round(cssProps.pr)}px]`);
  if (cssProps.pb > 0) classes.push(`pb-[${Math.round(cssProps.pb)}px]`);
  if (cssProps.pl > 0) classes.push(`pl-[${Math.round(cssProps.pl)}px]`);

  // ── Background & Borders ───────────────────────────────────────────────────
  if (cssProps.backgroundColor) {
    const match = mapper.findColor(cssProps.backgroundColor);
    classes.push(match ? match.tailwindBg : `bg-[${mapper.figmaColorToHex(cssProps.backgroundColor)}]`);
  }

  if (cssProps.strokeWeight > 0 && cssProps.strokeColor) {
    const sw = Math.round(cssProps.strokeWeight);
    if (sw === 1) classes.push('border');
    else classes.push(`border-[${sw}px]`);
    
    const match = mapper.findColor(cssProps.strokeColor);
    classes.push(match ? (match.tailwindBorder || match.tailwindBg.replace('bg-', 'border-')) : `border-[${mapper.figmaColorToHex(cssProps.strokeColor)}]`);
  }

  const nodeName = (node.name || '').toLowerCase();
  let forceRounded = null;
  
  if (cssProps.borderRadius > 10 || nodeName.includes('radio')) {
    forceRounded = 'rounded-full';
  } else if (cssProps.borderRadius > 0 && cssProps.borderRadius <= 10) {
    forceRounded = `rounded-[${Math.round(cssProps.borderRadius)}px]`;
  } else if (cssProps.borderRadius === 0) {
    forceRounded = 'rounded-none';
  }

  const hasChildren = node.children && node.children.length > 0;
  
  // ── Sizing (REGLAS DE DISEÑO LIBERADO) ─────────────────────────────────────
  // REGLA: No inyectar w-fit/h-fit por defecto (QA Fix)
  // Únicamente inyectar w-full si es FILL, STRETCH o Grow=1.
  if (node.layoutSizingHorizontal === 'FILL' || node.layoutAlign === 'STRETCH' || node.layoutGrow === 1) {
    classes.push('w-full');
  } else if (typeof cssProps.width === 'number' && cssProps.width > 0 && cssProps.width <= 48) {
    // Solo para elementos pequeños y fijos (iconos, etc)
    classes.push(`w-[${Math.round(cssProps.width)}px]`);
  }

  if (node.layoutSizingVertical === 'FILL') {
    classes.push('h-full');
  } else if (typeof cssProps.height === 'number' && cssProps.height > 0 && cssProps.height <= 48) {
    classes.push(`h-[${Math.round(cssProps.height)}px]`);
  }

  // REGLA: Anti-wrap para componentes pequeños (QA Fix)
  // Si es un contenedor pequeño (h <= 48), evitamos el wrap
  if (node.layoutMode === 'HORIZONTAL' && cssProps.height <= 48) {
    const wrapIdx = classes.indexOf('flex-wrap');
    if (wrapIdx > -1) classes.splice(wrapIdx, 1);
    classes.push('flex-nowrap');
  }

  // ── Mapeo Geométrico Estricto para Checkbox/Radio ───────
  const parentName = (parentNode && parentNode.name) ? parentNode.name.toLowerCase() : '';
  const isCheckboxMatch = nodeName.includes('checkbox') || parentName.includes('checkbox');
  const isRadioMatch = nodeName.includes('radio') || parentName.includes('radio');
  
  // Centrado Exclusivo sin alterar formas
  if (!hasTextContent(node) && (isRadioMatch || isCheckboxMatch || nodeName.includes('check'))) {
    if (!classes.includes('flex')) classes.push('flex');
    if (!classes.includes('items-center')) classes.push('items-center');
    if (!classes.includes('justify-center')) classes.push('justify-center');
  }

  // Aplicar redondeo final matemático
  if (forceRounded) {
    const roundedIdx = classes.findIndex(c => c.startsWith('rounded-'));
    if (roundedIdx > -1) classes.splice(roundedIdx, 1);
    classes.push(forceRounded);
  }

  return { classes, cssProps };
}

/**
 * Renderiza un nodo de Figma y sus hijos recursivamente.
 */
function renderNode(node, mapper, parentNode = null, depth = 0) {
  if (!node) return '';
  const indent = '  '.repeat(depth);

  // ── REGLA: Extreme Icon Flattening & Cortocircuito (QA Fix) ───────────────
  const { width = 0, height = 0 } = node.absoluteBoundingBox || {};
  const isNoLayout = !node.layoutMode || node.layoutMode === 'NONE';
  const isSmallNoLayout = isNoLayout && width > 0 && width < 36 && height > 0 && height < 36;
  const isIconName = (node.name || '').toLowerCase().includes('icon');
  const isVectorType = ['VECTOR', 'BOOLEAN_OPERATION', 'REGULAR_POLYGON', 'ELLIPSE', 'STAR'].includes(node.type);
  const containsText = hasTextContent(node);
  const hasStrokes = (node.strokes || []).some(s => s.visible !== false);
  
  const parentName = (parentNode && parentNode.name) ? parentNode.name.toLowerCase() : '';
  const isInsideUIElement = parentName.includes('checkbox') || parentName.includes('radio') || parentName.includes('check');
  
  const childName = (node.name || '').toLowerCase();
  const isActiveIndicator = ['check', 'mark', 'dot', 'selected'].some(k => childName.includes(k));

  // Excepción de Estilo Real: Si tiene borde (strokes) o es un indicador de estado activo, NO se aplana.
  const shouldFlatten = !containsText && !hasStrokes && !isInsideUIElement && !isActiveIndicator && (isVectorType || isIconName || isSmallNoLayout);

  if (shouldFlatten) {
    const w = Math.round(width) || 20;
    const h = Math.round(height) || 20;
    return `${indent}<div style={{ width: '${w}px', height: '${h}px' }} className="bg-gray-200 rounded-sm flex-shrink-0" />`;
  }

  const { classes: baseClasses } = resolveTailwindClasses(node, mapper, parentNode);
  const classes = [...baseClasses];
  let inlineStyles = '';

  // ── REGLA: Posicionamiento Absoluto en Hijos (Fix Real) ────────────────────
  if (parentNode && (!parentNode.layoutMode || parentNode.layoutMode === 'NONE')) {
    const relIdx = classes.indexOf('relative');
    if (relIdx > -1) classes.splice(relIdx, 1);
    classes.push('absolute');
    
    const childBox = node.absoluteBoundingBox;
    const parentBox = parentNode.absoluteBoundingBox;
    if (childBox && parentBox) {
      const left = Math.round(childBox.x - parentBox.x);
      const top = Math.round(childBox.y - parentBox.y);
      inlineStyles = `style={{ left: '${left}px', top: '${top}px' }}`;
    }
  }

  if (node.type === 'TEXT') {
    const textContent = (node.characters || '').trim();
    if (!textContent) return '';

    const textStyles = [];
    if (node.style) {
      if (node.style.fontSize) textStyles.push(`text-[${node.style.fontSize}px]`);
      const weightMap = { 400: 'normal', 500: 'medium', 600: 'semibold', 700: 'bold' };
      if (node.style.fontWeight) textStyles.push(`font-${weightMap[node.style.fontWeight] || 'normal'}`);
      const alignMap = { 'LEFT': 'text-left', 'CENTER': 'text-center', 'RIGHT': 'text-right' };
      if (node.style.textAlignHorizontal) textStyles.push(alignMap[node.style.textAlignHorizontal] || 'text-left');
    }
    
    const solidFill = (node.fills || []).find(f => f.type === 'SOLID' && f.visible !== false);
    if (solidFill) {
       const match = mapper.findColor(solidFill.color);
       textStyles.push(match ? match.tailwindText : `text-[${mapper.figmaColorToHex(solidFill.color)}]`);
    }

    // REGLA: No truncate ni w-full en textos (QA Fix)
    if (textContent.length < 50) {
      textStyles.push('whitespace-nowrap');
    }

    const finalTextClass = [...textStyles, ...classes].filter(Boolean).join(' ');
    return `${indent}<span className="${finalTextClass}" ${inlineStyles}>${textContent}</span>`;
  }

  // ── (Eliminada Regla de Wrapper Hell para preservar grillas Flexbox) ────────

  // REGLA: Alineación Vertical Forzada (QA Fix)
  if (node.layoutMode === 'HORIZONTAL' && node.children) {
    const hasText = node.children.some(c => c.type === 'TEXT');
    const hasIcon = node.children.some(c => 
      ['VECTOR', 'BOOLEAN_OPERATION', 'REGULAR_POLYGON', 'ELLIPSE', 'STAR'].includes(c.type) ||
      (c.name || '').toLowerCase().includes('icon')
    );
    if (hasText && hasIcon && !classes.includes('items-center')) {
      classes.push('items-center');
    }
  }

  const childrenTsx = (node.children || [])
    .map(child => renderNode(child, mapper, node, depth + 1))
    .filter(Boolean)
    .join('\n');

  const finalClass = classes.join(' ').trim() || 'relative';

  if (!childrenTsx) {
    // REGLA: HARDCODE PUNTO DE RADIO ACTIVO
    const pName = (parentNode && parentNode.name) ? parentNode.name.toLowerCase() : '';
    const cName = (node.name || '').toLowerCase();
    const isActInd = ['check', 'mark', 'dot', 'selected', 'ellipse'].some(k => cName.includes(k));
    
    if (pName.includes('radio') && isActInd) {
      const absClass = classes.includes('absolute') ? 'absolute ' : '';
      return `${indent}<div className="${absClass}w-2 h-2 bg-white rounded-full flex-shrink-0" ${inlineStyles} />`;
    }

    return (node.fills?.length > 0 || node.strokes?.length > 0) 
      ? `${indent}<div className="${finalClass}" ${inlineStyles} />` 
      : '';
  }

  return `${indent}<div className="${finalClass}" ${inlineStyles}>\n${childrenTsx}\n${indent}</div>`;
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

  return props;
}

function generateTsx({ pascalName, nodeId, doc, mapper }) {
  const content = renderNode(doc, mapper, null, 2);
  return `import React from 'react';

/**
 * Componente: ${pascalName}
 * Nodo Figma: ${nodeId}
 */
export const ${pascalName} = () => {
  return (
${content}
  );
};

export default ${pascalName};
`;
}

function hasTextContent(node) {
  if (node.type === 'TEXT') return (node.characters || '').trim().length > 0;
  if (node.children) return node.children.some(child => hasTextContent(child));
  return false;
}

function isIconComponent(node, pascalName) {
  const vectorTypes = ['VECTOR', 'BOOLEAN_OPERATION', 'REGULAR_POLYGON', 'ELLIPSE', 'STAR', 'LINE'];
  const nameLower = (node.name || '').toLowerCase();
  const pascalLower = (pascalName || '').toLowerCase();
  
  // Excepción: Elementos de Formulario vitales (Radio, Checkbox, Switch) no deben filtrarse
  if (nameLower.includes('radio') || nameLower.includes('checkbox') || nameLower.includes('switch') ||
      pascalLower.includes('radio') || pascalLower.includes('checkbox') || pascalLower.includes('switch')) {
    return false; 
  }

  // 1. Si el nodo principal es directamente un vector
  if (vectorTypes.includes(node.type)) return true;

  // 2. Si tiene texto, no es solo un ícono
  if (hasTextContent(node)) return false; 

  // 3. Revisión estructural profunda: solo vectores y frames sin autolayout
  if (node.children && node.children.length > 0) {
    let onlyVectors = true;
    let hasComplexLayout = false;

    function checkChild(child) {
      if (child.layoutMode && child.layoutMode !== 'NONE') hasComplexLayout = true;
      if (!vectorTypes.includes(child.type) && !['GROUP', 'FRAME', 'COMPONENT', 'INSTANCE'].includes(child.type)) {
        onlyVectors = false;
      }
      if (child.children) child.children.forEach(checkChild);
    }
    
    node.children.forEach(checkChild);

    const w = node.absoluteBoundingBox ? Math.round(node.absoluteBoundingBox.width) : 0;
    const h = node.absoluteBoundingBox ? Math.round(node.absoluteBoundingBox.height) : 0;
    
    // Si todo adentro es vector estructuralmente, y es de dimensiones de ícono, o carece completamente de Layout
    if (onlyVectors && ((w <= 80 && h <= 80) || !hasComplexLayout)) {
      return true;
    }
  }

  return false;
}

function generateComponents() {
  console.log('⚛️  React Generator (Fidelity Mode) — Iniciando...');
  const mapper = buildVariableMapper();

  if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ ERROR: No se encontró pilot-nodes.json. Debes ejecutar "npm run deep:fetch" primero.');
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  else {
    console.log(`🧹 Limpiando directorio (Vaciado Completo): ${OUTPUT_DIR}`);
    const files = fs.readdirSync(OUTPUT_DIR);
    for (const f of files) {
      try {
        const fullPath = path.join(OUTPUT_DIR, f);
        if (fs.statSync(fullPath).isFile()) {
           fs.unlinkSync(fullPath);
        }
      } catch (e) {
        console.warn(`No se pudo eliminar ${f}`);
      }
    }
  }

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const nodes = data.nodes || {}; 
  
  const entries = Object.entries(nodes);
  const totalNodes = entries.length;
  console.log(`\n📦 Total de nodos encontrados en JSON: ${totalNodes}`);

  if (totalNodes === 0) {
    console.log('❌ No hay nodos para generar. Revisa pilot-nodes.json / all-nodes.json');
    return;
  }

  const BATCH_SIZE = 500;
  let count = 0;
  let ignoredIcons = 0;

  for (let i = 0; i < totalNodes; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    console.log(`⏳ Procesando lote ${Math.floor(i / BATCH_SIZE) + 1} (Nodos ${i + 1} a ${Math.min(i + BATCH_SIZE, totalNodes)})...`);
    
    for (const [nodeId, nodeData] of batch) {
      const doc = nodeData.document;
      const pascalName = nodeData.pascalName;

      // Aplicar filtro de Bloqueo de Íconos
      if (isIconComponent(doc, pascalName)) {
        ignoredIcons++;
        continue;
      }

      // Generación Silenciosa para no saturar la terminal
      const tsx = generateTsx({ pascalName, nodeId, doc, mapper });
      fs.writeFileSync(path.join(OUTPUT_DIR, `${pascalName}.tsx`), tsx);
      count++;
    }
  }

  console.log(`\n🏁 Generación finalizada: ${count} componentes reactivos creados.`);
  console.log(`🛡️  Filtro de Íconos: Se ignoraron inteligentemente ${ignoredIcons} componentes que eran puramente vectoriales/íconos.`);
}

generateComponents();
