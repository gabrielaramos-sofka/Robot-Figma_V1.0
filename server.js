const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

let isGenerating = false;
let sseClients = [];

function broadcastSse(message) {
  sseClients.forEach(client => {
    // Reemplaza newlines para no quebrar el payload SSE if necessary
    const safeMsg = message.replace(/\n/g, '<br>');
    client.write(`data: ${safeMsg}\n\n`);
  });
}

// Check status endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: isGenerating ? 'running' : 'idle' });
});

// SSE endpoint to pipe terminal logs
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  sseClients.push(res);
  res.write(`data: ✨ Conexión con Motor Central establecida.\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

// Endpoint to generate and download MD Documentation
app.get('/api/download-md', (req, res) => {
  const { exec } = require('child_process');
  exec('node scripts/markdown-generator.js', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
       console.error(`Error generating MD: ${error.message}`);
       return res.status(500).send('Error interno al generar documento.');
    }
    const mdPath = path.join(__dirname, 'output', 'hukit-componentes-generados.md');
    res.download(mdPath, 'hukit-componentes-generados.md', (err) => {
       if (err) {
         console.error('Error enviando archivo al cliente:', err);
       }
    });
  });
});

// Endpoint to trigger Deep Fetch pipeline
app.post('/api/fetch', (req, res) => {
  if (isGenerating) {
    return res.status(409).json({ error: 'Proceso en curso. Por favor, espera.' });
  }

  const { figmaToken, fileId } = req.body;
  if (!figmaToken || !fileId) {
    return res.status(400).json({ error: 'Falta proveer figmaToken o fileId en la petición.' });
  }

  isGenerating = true;
  broadcastSse('🚀 [SISTEMA] Iniciando Extracción Profunda. Conectando con API de Figma...');

  // Configurar las variables de entorno inyectadas
  const envConfig = {
    ...process.env,
    FIGMA_API_TOKEN: figmaToken,
    FIGMA_FILE_ID: fileId
  };

  const child = spawn('npm', ['run', 'deep:fetch'], {
    cwd: __dirname,
    shell: true,
    env: envConfig
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(l => {
      const txt = l.trim();
      if(txt) broadcastSse(`💬 ${txt}`);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(l => {
      const txt = l.trim();
      if(txt) broadcastSse(`❌ [ERROR] ${txt}`);
    });
  });

  child.on('close', (code) => {
    isGenerating = false;
    broadcastSse(`🎯 [SISTEMA] Extracción finalizada. Exit code: ${code}`);
    broadcastSse('__FETCH_FINISHED__'); // Distinguir el finalizador
  });

  res.json({ message: 'Proceso de ingesta iniciado en background.' });
});

// Endpoint to trigger React Generation pipeline
app.post('/api/generate', (req, res) => {
  if (isGenerating) {
    return res.status(409).json({ error: 'Ya hay una generación en curso.' });
  }

  isGenerating = true;
  broadcastSse('🚀 [SISTEMA] Iniciando Secuencia Bi-Direccional. Reconstruyendo Ecosistema React...');
  
  // Ejecutar el script generador nativamente
  const child = spawn('npm', ['run', 'generate:react'], {
    cwd: __dirname,
    shell: true
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(l => {
      const txt = l.trim();
      if(txt) broadcastSse(`💬 ${txt}`);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(l => {
      const txt = l.trim();
      if(txt) broadcastSse(`❌ [ERROR] ${txt}`);
    });
  });

  child.on('close', (code) => {
    isGenerating = false;
    broadcastSse(`🎯 [SISTEMA] Tarea operativa finalizada. Exit code: ${code}`);
    broadcastSse('__FINISHED__');
  });

  res.json({ message: 'Generador exitosamente iniciado en background.' });
});

app.listen(PORT, () => {
  console.log(`\n\n-----------------------------------------------------------`);
  console.log(`🚀 API Antigravity Activa.`);
  console.log(`🖥️  Local Dashboard: http://localhost:${PORT}`);
  console.log(`-----------------------------------------------------------\n\n`);
});
