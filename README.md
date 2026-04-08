# Robot de Figma

![Status: Active](https://img.shields.io/badge/Status-Active-success)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)
![Node: >=18.0.0](https://img.shields.io/badge/Node-%3E%3D18.0.0-orange)

> Robot inteligente para la automatización, extracción profunda y generación de código (Design System) desde Figma.

## 📑 Tabla de Contenidos
- [🛠 Stack Tecnológico](#-stack-tecnológico)
- [⚡ Prerrequisitos](#-prerrequisitos-lo-que-necesitas-antes-de-empezar)
- [📦 Instalación](#-instalación)
- [⚙️ Configuración del Entorno (Setup)](#️-configuración-del-entorno-setup)
- [🚀 Verificación e Inicio Rápido](#-verificación-e-inicio-rápido)
- [🕹️ Usage (Cómo utilizar el Robot)](#️-usage-cómo-utilizar-el-robot)
- [🗂️ Commands (Diccionario de Funciones)](#️-commands-diccionario-de-funciones)
- [💡 Examples (Ejemplos Prácticos)](#-examples-ejemplos-prácticos)
- [🔄 Workflow (Ciclo de Vida del Operativo)](#-workflow-ciclo-de-vida-del-operativo)
- [🚧 Troubleshooting (Solución de Problemas)](#-troubleshooting-solución-de-problemas)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)
- [💬 Soporte / Contacto](#-soporte--contacto)

---

## 🛠 Stack Tecnológico
Este ecosistema automatizado funciona bajo una arquitectura robusta orientada a la manipulación del AST de React y la conexión con la fuente de la verdad de diseño:

* **Node.js** - Entorno de ejecución principal (Backend local / Ingestor CLI).
* **Express.js** - Servidor que distribuye la interfaz del Dashboard Local (Arquitectura API-First).
* **Figma REST API** - Motor de extracción pura de diseño (Mapeo de Nodos, Componentes y Variables/Tokens).
* **React** - Interfaz de visualización de datos (Data-Driven UI Component Viewer).
* **Tailwind CSS** - Responsable del mapeo estricto del sistema de diseño (HUKIT 2.0).

## ⚡ Prerrequisitos (Lo que necesitas antes de empezar)
Para que el ecosistema y la extracción profunda operen exitosamente, asegúrate de tener lo siguiente configurado en tu entorno:

1. **Credenciales de Figma**:
   * **Figma Personal Access Token (PAT):** Necesario para que el robot se autentique ante la API.
   * **Figma File ID (File Key):** El identificador único del archivo de Figma que contiene el Design System objetivo.

2. **Entorno de Ejecución Tecnológico**:
   * **Node.js:** Versión 18.0.0 o superior (Altamente recomendado LTS 20.x).
   * **NPM** (o **Bun**/**Yarn**): Como gestor principal de dependencias del proyecto.

## 📦 Instalación

Sigue estos pasos secuenciales para descargar y preparar la base de código del robot en tu máquina local:

1. **Clonación del Repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd "Robot de figma"
   ```

2. **Instalación de Dependencias:**
   Una vez dentro del directorio raíz, ejecuta el gestor de paquetes para descargar la arquitectura del motor y las dependencias del ecosistema.
   ```bash
   npm install
   # O alternativamente: bun install
   ```

## ⚙️ Configuración del Entorno (Setup)

Las credenciales que permitirán al Robot acceder a la fuente de la verdad en la API deben conservarse bajo estricta seguridad local.

1. **Duplica el archivo de entorno base:** Copia el archivo `.env.example` suministrado en el proyecto para crear tu ambiente estricto:
   ```bash
   cp .env.example .env
   ```

2. **Añade las claves operativas:**
   * Abre tu nuevo archivo `.env`.
   * Reemplaza los placeholders en variables críticas como `FIGMA_API_TOKEN` y `FIGMA_FILE_ID` con tus datos operacionales.

> ⚠️ **CRÍTICO - SEGURIDAD:** 
> Debes velar siempre porque el archivo `.env` NO ESTÉ sujeto a control de versiones. Revisa y garantiza que se encuentre listado o protegido en el `.gitignore`.

## 🚀 Verificación e Inicio Rápido

Para iniciar el servidor principal o el Dashboard de desarrollo del Robot y confirmar una instalación exitosa, usa el proceso de inicio:

```bash
npm run dev
# (Dependiendo de la configuración explícita, también puedes iniciar el servidor y backend principal vía start o comandos customizados.)
```

## 🕹️ Usage (Cómo utilizar el Robot)

El Robot de Figma puede interactuar de múltiples formas dependiendo del nivel de acceso que requieras. Principalmente, su operación se ejecuta mediante la Interfaz de Línea de Comandos (CLI) que inicializa la arquitectura de extracción.

1. Abre tu terminal en la carpeta principal del proyecto.
2. Asegúrate de que las variables de entorno en tu `.env` estén correctamente configuradas.
3. Ejecuta el comando de acción deseado desde el menú de opciones (ver sección *Commands*).
4. El servidor local procesará los nodos de diseño y habilitará la interfaz remota (`http://localhost:3000`) para consultar el Dashboard y descargar los catálogos resultantes.

## 🗂️ Commands (Diccionario de Funciones)

El ecosistema expone una lista principal de comandos listos para ser invocados:

| Comando | Acción Principal | Descripción de Comportamiento |
| :--- | :--- | :--- |
| `npm run dev` | **Servidor / GUI** | Inicializa el panel visual (Dashboard Local) para la operación gráfica del sistema. |
| `npm run sync` | **Pull de Data** | Se conecta a Figma y descarga el árbol JSON crudo con la metadata de componentes y tokens. |
| `npm run export` | **Generación de Código** | Transforma el mapa estructural en archivos de código real (`.tsx`) listos para producción. |
| `npm run audit` | **Auditoría / Documentación**| Invoca al motor Markdown para extraer la tabla profunda de propiedades y estados reales extraídos. |

## 💡 Examples (Ejemplos Prácticos)

A continuación explicamos el flujo base que puedes emplear para operaciones rutinarias en tu CLI o como peticiones (prompts) conversacionales:

**Ejemplo Operativo 1: Extracción Segura**
> *"Robot, actualiza la base de código exportando los componentes transformados más recientes."*
```bash
# Instruye al robot a generar toda la documentación React.
npm run export
```

**Ejemplo Operativo 2: Generación Dinámica Documental**
> *"Generar el catálogo de propiedades del sistema (HuKit MD) a partir de los tokens locales de Figma."*
```bash
# Audita el mapeo previamente extraído y crea las tablas técnicas MD.
npm run audit
```

## 🔄 Workflow (Ciclo de Vida del Operativo)

Para comprender con exactitud qué sucede cuando interactúas con el Robot de Figma, aquí está el flujo operativo:

1. **Ejecución Técnica:** Confirmación de tu orden local (botón UI o CLI).
2. **Procesamiento Subyacente:** Envío estructurado de la petición a la API REST de Figma y análisis exhaustivo de capas (AST de nodos vectoriales / booleanos).
3. **Conversión y Volcado:** Generación en memoria RAM y escritura en disco (`/output`) como archivos React con Propiedades Inyectadas o Markdowns Data-Driven.
4. **Entrega de Resultado:** El cambio sube a tu entorno visual local y el ecosistema reporta 100% de paridad con Figma.

## 🚧 Troubleshooting (Solución de Problemas)

A continuación, una tabla referencial con los 3 errores más comunes y su solución recomendada:

| Error / Síntoma | Causa Frecuente | Solución Estandarizada |
| :--- | :--- | :--- |
| **Token de Figma expirado (401/403)** | El token PAT ha caducado de tu cuenta o te revocaron los accesos de proyecto. | Dirígete a *Figma → Account Settings → Personal Access Tokens*, genera un token fresco y reemplázalo en `FIGMA_API_TOKEN` en tu `.env`. |
| **Conflicto de Puertos (`EADDRINUSE`)** | El dashboard local falla al intentar acceder al puerto `3000` (u otro usado por defecto). | Cierra proyectos React/Node en tu memoria (ej. `killall node` en Mac/Linux), o asigna un puerto diferente a tu entorno manual. |
| **Permisos de Escritura Denegados (`EACCES`)** | El script NodeJS no cuenta con permisos administrativos para escribir en el disco (la carpeta `output/`). | Ejecuta la terminal con privilegios de Administrador (Windows) o restablece los permisos granulares (`chmod`/`chown` en Unix) sobre el clúster local. |

## 🤝 Contribución

¡El ecosistema del Robot de Figma es impulsado en conjunto! Para involucrarte:
1. Realiza un **Fork** de este repositorio base.
2. Extrae una rama específica para tu funcionalidad (`git checkout -b feature/MiNuevaMejora`).
3. Efectúa tus commits manteniendo siempre convenciones legibles y documentadas.
4. Empuja (*push*) un **Pull Request** a origen para ser evaluado.  
*Por favor, corre pruebas unitarias antes de enviar integraciones masivas al parseador de React.*

## 📄 Licencia

Este ecosistema ha sido liberado bajo la **Licencia MIT**. Eres libre de adaptar, modificar y aprovechar esta herramienta para tu cadena de suministro, solicitando tan solo la preservación de la atribución original.

## 💬 Soporte / Contacto

¿Detectaste un nuevo límite de API o precisas asistencia técnica en el motor CLI?
Dirígete a la sección central de *[GitHub Issues](#)* (o al placeholder designado del repositorio) para abrir un ticket narrando el comportamiento que lograste reproducir.

---
Documento generado mediante IA | Robot creado por: Gabriela Ramos Rangel - UX&UI Specialist
