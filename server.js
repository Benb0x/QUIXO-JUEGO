const express = require('express');
const path = require('path');
const app = express();

// Configurar la carpeta 'src' como estática
app.use(express.static(path.join(__dirname, 'src')));

// Ruta principal que sirve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Ruta para manejar las solicitudes de archivos de sonido
app.get('/sounds/:sound', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'sounds', req.params.sound));
});

// Escuchar en el puerto 3001
const PORT = 3001; // Cambiaste el puerto a 3001 según tus capturas de pantalla
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});