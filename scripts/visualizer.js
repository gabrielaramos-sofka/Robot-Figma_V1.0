const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../output/react-components');
const patchFile = path.join(__dirname, '../tailwind.config.patch.js');
const outputFile = path.join(__dirname, '../output/ver-mis-componentes.html');

function generate() {
    console.log('🚀 Generando visualizador...');
    if (!fs.existsSync(componentsDir)) return console.error('❌ No hay componentes');

    let tailwindConfig = '{}';
    if (fs.existsSync(patchFile)) {
        const patch = fs.readFileSync(patchFile, 'utf-8');
        // Extraer el objeto extend completo
        const match = patch.match(/extend:\s+(\{[\s\S]+?\n\s+\})/);
        if (match) {
            tailwindConfig = match[1];
        }
    }

    const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
    const componentsData = [];
    
    files.forEach(file => {
        const name = file.replace('.tsx', '');
        const code = fs.readFileSync(path.join(componentsDir, file), 'utf-8');
        const match = code.match(/return\s+\(\s*([\s\S]+?)\s*\);/);
        if (!match) return;
        
        let html = match[1]
            .replace(/className=/g, 'class=')
            .replace(/style=\{\{\s*([^}]+)\s*\}\}/g, (_, stylesContent) => {
                 const clean = stylesContent.replace(/['"]/g, '').replace(/,/g, ';');
                 return `style="${clean};"`;
            })
            .replace(/\{`|`\}|\{|\}/g, '')
            .replace(/<([a-z0-9]+)([^>]*)\/>/gi, '<$1$2></$1>')
            .replace(/children/g, '')
            .trim();
        
        componentsData.push({ name, html });
    });

    const componentsJson = JSON.stringify(componentsData).replace(/</g, '\\u003c');

    const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Figma Catalog — Massive View</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">
    <script>
        tailwind.config = { theme: { extend: ${tailwindConfig} } }
    </script>
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-[#F0F2F5] min-h-screen text-gray-900">
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 md:px-8 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div>
            <h1 class="text-2xl font-black tracking-tight">Design System <span class="text-blue-600">Catalog</span></h1>
            <p id="statsDisplay" class="text-sm font-medium text-gray-500">Cargando...</p>
        </div>
        <div class="flex items-center gap-4 w-full md:w-auto">
            <input id="searchInput" type="text" placeholder="Buscar componente..." class="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 transition-all">
            <div class="flex items-center gap-2">
                <button id="prevBtn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">Anterior</button>
                <span id="pageDisplay" class="text-sm font-bold min-w-[4rem] text-center">1</span>
                <button id="nextBtn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">Siguiente</button>
            </div>
        </div>
    </header>

    <main class="p-8 md:p-12">
        <div id="cards-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <!-- Cards Rendered via JS -->
        </div>
    </main>

    <footer class="mt-20 py-10 border-t border-gray-200 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">
        Antigravity Robot • Massive Catalog
    </footer>

    <script>
        const allComponents = ${componentsJson};
        let filtered = allComponents;
        let currentPage = 1;
        const itemsPerPage = 100;

        const container = document.getElementById('cards-container');
        const searchInput = document.getElementById('searchInput');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageDisplay = document.getElementById('pageDisplay');
        const statsDisplay = document.getElementById('statsDisplay');

        function render() {
            const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;

            const startIdx = (currentPage - 1) * itemsPerPage;
            const endIdx = startIdx + itemsPerPage;
            const currentSlice = filtered.slice(startIdx, endIdx);

            container.innerHTML = currentSlice.map(comp => \`
                <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300">
                    <header class="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center group relative cursor-help">
                        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate w-full" title="\${comp.name}">\${comp.name}</span>
                        <div class="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded -top-8 left-0 z-50 whitespace-nowrap shadow-lg">\${comp.name}</div>
                    </header>
                    <div class="flex-1 p-8 flex items-center justify-center bg-[#F8F9FB] min-h-[200px] overflow-hidden">
                        <div class="w-full flex items-center justify-center">
                            \${comp.html}
                        </div>
                    </div>
                </div>
            \`).join('');

            pageDisplay.textContent = \`\${currentPage} / \${totalPages}\`;
            statsDisplay.textContent = \`Mostrando \${startIdx + 1} - \${Math.min(endIdx, filtered.length)} de \${filtered.length} componentes (Catálogo Total: \${allComponents.length})\`;
            
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filtered = allComponents.filter(c => c.name.toLowerCase().includes(query));
            currentPage = 1;
            render();
        });

        prevBtn.addEventListener('click', () => { 
            if (currentPage > 1) { 
                currentPage--; 
                render(); 
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } 
        });
        nextBtn.addEventListener('click', () => { 
            if (currentPage < Math.ceil(filtered.length / itemsPerPage)) { 
                currentPage++; 
                render(); 
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } 
        });

        render();
    </script>
</body>
</html>`;

    fs.writeFileSync(outputFile, htmlTemplate, 'utf-8');
    console.log('✅ Visualizador creado en: ' + outputFile);
}

generate();
