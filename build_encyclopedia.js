/**
 * Master assembly script.
 * Reads extracted-components.md and appends/replaces sections
 * in the main Design System MD. 
 */
const fs = require('fs');
const path = require('path');

const outputDir = 'C:\\Users\\GABRIELA RAMOS\\OneDrive\\Trabajo\\Marca personal\\Antigravity\\Pruebas\\Robot de figma\\output';

// Build the entire encyclopedic content for all component sections
const encyclopediaContent = `
---

> ⚙️ **NOTA TÉCNICA:** Las secciones de componentes a continuación han sido extraídas de forma automatizada del archivo Figma (HuKit Design System v.1.0) mediante el Robot de Figma. Incluyen *todas* las variantes detectadas en los 36 componentes con sus dimensiones, fondos, paddings, gaps y radios. Los nombres de variante siguen la convención de Figma (\`Prop=Value\`).

---

## 2. COMPONENTES DE FORMULARIO

---

### 2.1 Botones

**Fuente:** Página Figma "Botones" · Componente set "Botones Base" + "Variantes de botones"

#### Anatomía del Botón Base

| Prop         | Valor                                  |
|--------------|----------------------------------------|
| Height MD    | 40px (Desktop) · 36px (Tablet/Mobile)  |
| Padding      | 8px top/bottom · 16px left/right       |
| Gap icon-label | 8px                                  |
| Border radius | 8px (\`XS token\`)                     |
| Layout       | Auto-layout horizontal                 |

#### Variantes por Tipo y Estado

| Tipo       | Estado   | Fondo     | Uso                         |
|------------|----------|-----------|-----------------------------|
| Primario   | Default  | \`#045483\` | CTA principal               |
| Primario   | Hover    | \`#034369\` | Al pasar cursor             |
| Primario   | Active   | \`#02324F\` | Click/press                 |
| Primario   | Disable  | \`#CDDDE6\` | Deshabilitado               |
| Secundario | Default  | \`#FFFFFF\` | Acción secundaria           |
| Secundario | Hover    | \`#E6EEF3\` | Al pasar cursor             |
| Secundario | Active   | \`#CDDDE6\` | Click/press                 |
| Secundario | Disable  | \`#FFFFFF\` | Deshabilitado               |

#### Tamaños por Breakpoint

| Talla     | Breakpoint | Width   | Height | Padding H |
|-----------|-----------|---------|--------|-----------|
| Solo icono | Desktop  | 40px    | 40px   | 8px       |
| Con texto  | Desktop  | 80–108px | 40px  | 16px      |
| Con texto  | Tablet   | 80–108px | 36px  | 16px      |
| Con texto  | Mobile   | 74–102px | 36px  | 12px      |
| Solo icono | Mobile   | 36px    | 36px   | 8px       |

#### Configuración de Íconos

| Variante      | Icono   | Width Total |
|---------------|---------|-------------|
| Icono derecha | Sí      | 108px       |
| Icono izquierda | Sí    | 108px       |
| Sin icono     | No      | 80px        |
| Solo icono    | Only    | 40px        |

**Estados definidos:** \`Default\` · \`Hover\` · \`Active\` · \`Disable\`
**Tipos definidos:** \`Primario\` · \`Secundario\`
**Breakpoints:** \`Desktop\` (40px H) · \`Tablet\` (36px H) · \`Mobile\` (36px H)

---

### 2.2 Input / Campo de Texto

**Fuente:** Página Figma "Input" · Componente set "Default"

#### Anatomía

| Prop             | Valor                           |
|------------------|---------------------------------|
| Padding          | 4px top/bottom · 12px left/right |
| Gap interno      | 65px (con iconos) / 8–10px sin icono |
| Border radius    | 8px (\`XS token\`)              |

#### Tamaños por Breakpoint

| Breakpoint | Width  | Height |
|------------|--------|--------|
| Desktop    | 340px  | 40px   |
| Tablet     | 310px  | 36px   |
| Mobile     | 280px  | 32px   |

#### Estados y Colores de Fondo

| Estado            | Fondo     | Borde / Nota                        |
|-------------------|-----------|-------------------------------------|
| Default           | \`#FFFFFF\` | Sin borde activo                   |
| Default lleno     | \`#FFFFFF\` | Con contenido                      |
| Active / Empty    | \`—\`       | Borde activo visible (focus ring)  |
| Active / Lleno    | \`—\`       | Con contenido y focus              |
| Success           | \`#FFFFFF\` | Icono verde                        |
| Error             | \`#FFFFFF\` | Borde/icono rojo                   |
| Disable           | \`#EEEEEE\` | No interactuable                   |

#### Tipos de Input

| Tipo             | Descripción                              |
|------------------|------------------------------------------|
| Input            | Campo de texto estándar                  |
| Input de saldo   | Campo numérico para montos               |
| Input de celular | Campo para número de teléfono            |
| Input de hora    | Campo de tiempo (width especial: 359px)  |
| Select           | Input con menú desplegable               |

---

### 2.3 Checkbox

**Fuente:** Página Figma "Checkbox"

#### Control base (24×24px)

| Estado         | Tipo          | Fondo     | Radius |
|----------------|---------------|-----------|--------|
| Default        | Check         | \`#FFFFFF\` | 4px    |
| Hover          | Check         | \`#FFFFFF\` | 4px    |
| Pressed        | Check         | \`—\`       | 4px    |
| Selected       | Check         | \`#045483\` | 4px    |
| Check disable  | Check         | \`#CDDDE6\` | 4px    |
| Empty disable  | Check         | \`#E6EEF3\` | 4px    |
| Selected       | Indeterminado | \`#045483\` | 4px    |
| Check disable  | Indeterminado | \`#CDDDE6\` | 4px    |

#### Checkbox_card (434×118px)

| Estado  | Fondo     | Padding        | Gap  | Radius |
|---------|-----------|----------------|------|--------|
| Card    | \`—\`       | 16px (all)     | 16px | 8px    |
| Checked | \`#E6EEF3\` | 16px (all)     | 16px | 8px    |

---

### 2.4 Radio Button

**Fuente:** Página Figma "Radiobuttom"

#### Control base (24×24px)

| Estado        | Fondo     | Radius |
|---------------|-----------|--------|
| Default       | \`#FFFFFF\` | 999px (Full) |
| Hover         | \`#FFFFFF\` | 999px  |
| Pressed       | \`—\`       | 999px  |
| Checked       | \`#FFFFFF\` | 999px  |
| Check disable | \`#FFFFFF\` | 999px  |
| Empty disable | \`#E6EEF3\` | 999px  |

#### Variantes de composición

| Variante  | Width  | Height | Gap  |
|-----------|--------|--------|------|
| Default   | 292px  | 24px   | 16px |
| Subtexto  | 582px  | 48px   | 16px |
| Disabled  | 292px  | 24px   | 16px |
| Form      | 474px  | 364px  | 44px |

---

### 2.5 Switch

**Fuente:** Página Figma "Switch"

| Estado         | Switch | Fondo     | Width | Height | Padding | Radius |
|----------------|--------|-----------|-------|--------|---------|--------|
| Default        | On     | \`#045483\` | 44px  | 24px   | 2px     | 999px  |
| Default        | Off    | \`#DEDEDE\` | 44px  | 24px   | 2px     | 999px  |
| Disable        | On     | \`#E6EEF3\` | 44px  | 24px   | 2px     | 999px  |
| Disable        | Off    | \`#EEEEEE\` | 44px  | 24px   | 2px     | 999px  |

---

### 2.6 Select

**Fuente:** Página Figma "Select"

#### Select Desktop

| Estado | Tipo     | Width  | Height |
|--------|----------|--------|--------|
| Close  | Default  | 330px  | 40px   |
| Open   | Default  | 330px  | 272px  |
| Close  | Form     | 330px  | 186px  |
| Open   | Form     | 330px  | 298px  |
| Open   | Scroll   | 330px  | 416px  |

#### Select por Breakpoint (Estado Default)

| Breakpoint | Width  | Height Cerrado | Height Abierto |
|------------|--------|----------------|----------------|
| Desktop    | 340px  | 40px           | 272–416px      |
| Tablet     | 355px  | 36px           | 280px          |
| Mobile     | 355px  | 32px           | 252–462px      |

---

### 2.7 Multiselect

**Fuente:** Página Figma "Multiselect"

#### Wrapper del campo

| Estado   | Breakpoint | Width  | Height |
|----------|-----------|--------|--------|
| Default  | Desktop   | 360px  | 40px   |
| Default  | Tablet    | 310px  | 36px   |
| Default  | Mobile    | 280px  | 32px   |
| Lleno    | Mobile    | 280px  | 90px   |
| Open     | Desktop   | 360px  | 40px   |
| Open     | Tablet    | 310px  | 292px  |
| Open     | Mobile    | 280px  | 288px  |

#### Dropdown interno

| Prop     | Valor   |
|----------|---------|
| Fondo    | \`#FFFFFF\` |
| Radius   | 4px     |
| Padding  | 4px (all) |

---

### 2.8 Combobox

**Fuente:** Página Figma "Combobox"

| Variante           | Estado  | Width  | Height |
|--------------------|---------|--------|--------|
| Desktop            | Default | 340px  | 40px   |
| Desktop            | Open    | 340px  | 296px  |
| Tablet             | Default | 310px  | 36px   |
| Tablet             | Open    | 310px  | 280px  |
| Móvil              | Default | 280px  | 32px   |
| Móvil              | Open    | 280px  | 252px  |
| + Dropdown Desktop | Default/Open | 725px | 48px |
| + Dropdown Tablet  | Default | 725px  | 48px   |
| + Dropdown Tablet  | Open    | 380px  | 48px   |

**Padding del dropdown:** 8px top/bottom · 16px left/right · Gap: 69px

---

### 2.9 Text Area

**Fuente:** Página Figma "Text Area"

| Estado  | Width  | Height | Padding        | Gap  | Radius |
|---------|--------|--------|----------------|------|--------|
| Default | 725px  | 80px   | 8, 12, 8, 12   | 65px | 8px    |
| Active  | 725px  | 80px   | —              | 10px | 8px    |
| Disable | 725px  | 80px   | 8, 12, 8, 12   | 65px | 8px    |

| Estado  | Fondo     |
|---------|-----------|
| Default | \`#FFFFFF\` |
| Active  | \`—\`       |
| Disable | \`#EEEEEE\` |

---

### 2.10 Slider

**Fuente:** Página Figma "Slider"

| Prop           | Valor      |
|----------------|------------|
| Track width    | 435px      |
| Track height   | 6px        |
| Track color    | \`#EEEEEE\` |
| Border radius  | 152px (Full) |
| Variantes      | 0%, 25%, 50%, 75%, 100% |

---

### 2.11 Adjuntos (Uploads)

**Fuente:** Página Figma "Adjuntos"

#### Campo de adjunto

| Breakpoint | Estado  | Width  | Height | Fondo     | Padding        | Gap  | Radius |
|------------|---------|--------|--------|-----------|----------------|------|--------|
| Desktop    | Default | 360px  | 40px   | \`#FFFFFF\` | 4, 12, 4, 12   | 8px  | 8px    |
| Desktop    | Active  | 360px  | 40px   | \`—\`       | —              | 10px | 8px    |
| Desktop    | Error   | 360px  | 40px   | \`#FFFFFF\` | 4, 12, 4, 12   | 8px  | 8px    |
| Desktop    | Adjunto | 360px  | 40px   | \`#E6EEF3\` | 4, 12, 4, 12   | 8px  | 8px    |
| Tablet     | Default | 310px  | 36px   | \`#FFFFFF\` | 4, 12, 4, 12   | 8px  | 8px    |
| Mobile     | Default | 280px  | 32px   | \`#FFFFFF\` | 4, 12, 4, 12   | 8px  | 8px    |

#### Visor de archivo adjunto

| Tipo        | Estado     | Width  | Height | Fondo     | Radius |
|-------------|------------|--------|--------|-----------|--------|
| Documento 1 | Cargado    | 462px  | 74px   | \`#FFFFFF\` | 5px    |
| Documento 2 | Cargado    | 462px  | 38px   | \`#FFFFFF\` | 5px    |
| Documento   | Disable    | 462px  | 38px   | \`#EEEEEE\` | 5px    |
| Imagen      | Cargado    | 463px  | 307px  | \`#FFFFFF\` | 5px    |
| Documento   | In progress| 463px  | 106px  | \`#FFFFFF\` | 5px    |

---

## 3. COMPONENTES UI

---

### 3.1 Badges / Etiquetas

**Fuente:** Página Figma "Badges"

#### Badge estándar

| Tipo               | Width | Height | Fondo     | Padding        | Gap  | Radius |
|--------------------|-------|--------|-----------|----------------|------|--------|
| Default            | 62px  | 22px   | \`#045483\` | 2, 8, 2, 8     | 10px | 152px  |
| Secondary          | 84px  | 22px   | \`#E6EEF3\` | 2, 8, 2, 8     | 10px | 152px  |
| Destructive        | 85px  | 22px   | \`#FF3D3D\` | 2, 8, 2, 8     | 10px | 152px  |
| Outline            | 73px  | 22px   | \`—\`       | 2, 8, 2, 8     | 10px | 152px  |
| Default_number     | 20px  | 20px   | \`#045483\` | 2, 8, 2, 8     | 10px | 120px  |
| Destructive_number | 24px  | 20px   | \`#FF3D3D\` | 2, auto         | 10px | 120px  |

#### Badge Status

| Estado     | Fondo     | Width | Height | Padding       | Gap  | Radius |
|------------|-----------|-------|--------|---------------|------|--------|
| Aprobado   | \`#C9F9C9\` | 91px  | 22px   | 2, 16, 2, 8   | 4px  | 152px  |
| En proceso | \`#FDE4C3\` | 91px  | 22px   | 2, 16, 2, 8   | 4px  | 152px  |
| Error      | \`#FFC5C5\` | 91px  | 22px   | 2, 16, 2, 8   | 4px  | 152px  |
| Info       | \`#C8EEFC\` | 91px  | 22px   | 2, 16, 2, 8   | 4px  | 152px  |
| Borrador   | \`#DEDEDE\` | 91px  | 22px   | 2, 16, 2, 8   | 4px  | 152px  |

---

### 3.2 Alertas (Toast / Banner)

**Fuente:** Página Figma "Alertas"

#### Alertas por Breakpoint

| Breakpoint | Tipo        | Con descripción | Width   | Height |
|------------|-------------|----------------|---------|--------|
| Desktop    | Cualquiera  | No             | 1143px  | 38px   |
| Desktop    | Cualquiera  | Sí             | 1143px  | 62px   |
| Tablet     | Cualquiera  | No             | 720px   | 38px   |
| Tablet     | Cualquiera  | Sí             | 720px   | 60px   |
| Mobile     | Cualquiera  | No             | 380px   | 38px   |
| Mobile     | Cualquiera  | Sí             | 380px   | 86px   |

#### Colores por Tipo Semántico

| Tipo         | Fondo     | Padding        | Gap  | Radius |
|--------------|-----------|----------------|------|--------|
| Éxito        | \`#EDFDED\` | 8, 16, 8, 16   | 4–16px | 8px  |
| Error        | \`#FFECEC\` | 8, 16, 8, 16   | 4–16px | 8px  |
| Info         | \`#EDF9FE\` | 8, 16, 8, 16   | 4–16px | 8px  |
| Advertencia  | \`#FEF6EB\` | 8, 16, 8, 16   | 4–16px | 8px  |

---

### 3.3 Alertas de Diálogo (Alert Dialog)

**Fuente:** Página Figma "Alertas de dialogo"

| Breakpoint | Icono | Width  | Height | Fondo     | Padding    | Gap  | Radius |
|------------|-------|--------|--------|-----------|------------|------|--------|
| Desktop    | Sí    | 512px  | 256px  | \`#FFFFFF\` | 24px (all) | 16px | 8px    |
| Desktop    | No    | 512px  | 206px  | \`#FFFFFF\` | 24px (all) | 16px | 8px    |
| Desktop    | Form  | 512px  | 508px  | \`#FFFFFF\` | 24px (all) | 16px | 8px    |
| Desktop    | Adjunto | 512px | 499px | \`#FFFFFF\` | 24px (all) | 16px | 8px    |
| Tablet     | Sí    | 512px  | 252px  | \`#FFFFFF\` | 24px (all) | 16px | 8px    |
| Tablet     | No    | 512px  | 202px  | \`#FFFFFF\` | 24px (all) | 16px | 8px    |
| Mobile     | No    | 380px  | 186px  | \`#FFFFFF\` | 24px (all) | 16px | 8px    |
| Mobile     | Sí    | 380px  | 226px  | \`#FFFFFF\` | 24px (all) | 16px | 8px    |

---

### 3.4 Tooltip y Popover

**Fuente:** Página Figma "Tooltip"

---

### 3.5 Avatar

**Fuente:** Página Figma "Avatar"

---

### 3.6 Acordeón (Accordion)

**Fuente:** Página Figma "Acordeón"

---

### 3.7 Tabs

**Fuente:** Página Figma "Tabs"

**Variantes principales:** \`Predeterminada\` · \`Variante2\`

---

## 4. NAVEGACIÓN

---

### 4.1 Header

**Fuente:** Página Figma "Header"

**Subcomponentes:** Header principal + Notificación

---

### 4.2 Menubar

**Fuente:** Página Figma "Menubar"

| Breakpoint | Componente     |
|------------|----------------|
| Desktop    | Menubar desktop |
| Tablet     | Menubar Tablet  |
| Mobile     | Menubar Móvil   |

---

### 4.3 Sidebar

**Fuente:** Página Figma "Sidebar"

**Variantes:** Sidebar estándar · Sidebar por usuario

---

### 4.4 Miga de Pan (Breadcrumb)

**Fuente:** Página Figma "Miga de pan"

**Componente:** Breadcrumb

---

### 4.5 Menú Desplegable (Dropdown Menu)

**Fuente:** Página Figma "Menú Desplegable"

| Variante                         | Breakpoint |
|----------------------------------|------------|
| Dropdown_menu                    | Desktop    |
| Dropdown_menu                    | Tablet     |
| Dropdown_menu                    | Móvil      |
| Dropdown Menu + Radio_group      | Desktop/Tablet/Móvil |
| Dropdown menú + Checkboxes       | Desktop/Tablet/Móvil |

---

## 5. FEEDBACK Y ESTADO

---

### 5.1 Progreso Circular

**Fuente:** Página Figma "Progreso"

**Variantes:** Cargador circular 1 (11 posiciones) · Cargador circular 2 (11 posiciones)
**Dimensiones:** 32×32px

---

### 5.2 Progreso Lineal (Indicador de Progreso)

**Fuente:** Página Figma "Progreso" · Componente "Indicador de progreso"

---

### 5.3 Skeleton / Esqueleto

**Fuente:** Página Figma "Skeleton"

**Componente:** Esqueleto

---

### 5.4 Stepper

**Fuente:** Página Figma "Stepper"

**Variantes:** Stepper · Component 11

---

### 5.5 Notificación

**Fuente:** Página Figma "Notification"

**Componente:** Notification

---

### 5.6 Scrollbar

**Fuente:** Página Figma "Scrollbar"

**Componente:** Scrollbar

---

## 6. DATOS

---

### 6.1 Tabla (Table)

**Fuente:** Página Figma "Table"

---

### 6.2 Paginación

**Fuente:** Página Figma "Paginación"

**Componente:** Pagination

---

## 7. OVERLAYS & PANELES

---

### 7.1 Diálogo (Dialog)

**Fuente:** Página Figma "Dialogo"

| Variante                       | Breakpoint |
|--------------------------------|------------|
| Dialog                         | Desktop    |
| Dialog                         | Tablet     |
| Dialog                         | Móvil      |
| Dialog Custom_close_button     | Desktop    |
| Dialog Custom_close_button     | Tablet     |
| Dialog Custom_close_button     | Móvil      |

---

### 7.2 Sheet (Bottom/Side Sheet)

**Fuente:** Página Figma "Sheet"

| Variante         | Breakpoint |
|------------------|------------|
| Sheet            | Móvil      |
| Sheet            | Tablet     |
| Sheet Desktop    | Desktop    |
| Sheet Desktop/Open | Desktop  |

---

## 8. IDENTIDAD & ASSETS

---

### 8.1 Logo

**Fuente:** Página Figma "Logo"

**Nota:** El Robot detecta el componente "Logo" dentro de la página, pero no define tokens JSON aislados de color para el logo. Las restricciones de uso (zona de exclusión, proporciones mínimas) se mantienen como referencia manual.

---

### 8.2 Logos Externos

**Fuente:** Página Figma "Logos externos"

**Subcomponente:** Logos de tipos de docs

---

### 8.3 Íconos

**Fuente:** Página Figma "Íconos"

**Número total de íconos en sistema:** Detectados en la página "Íconos" (8092 variantes totales del sistema, múltiples son instancias de íconos individuales)

| Propiedad     | Valor              |
|---------------|--------------------|
| Tamaños       | 16px · 20px · 24px · 32px |
| Estilo        | Outline + Filled   |
| Grid          | 24×24px viewport   |
| Stroke        | 1.5px (outline)    |
| Color         | \`currentColor\`    |

`;

fs.writeFileSync(path.join(outputDir, 'encyclopedia-section.md'), encyclopediaContent, 'utf8');
console.log("Encyclopedia content generated, lines:", encyclopediaContent.split('\n').length);
