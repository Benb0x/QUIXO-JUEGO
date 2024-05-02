const express = require('express');
const path = require('path');
const app = express();

// Configurar la carpeta 'src' como estática
app.use(express.static(path.join(__dirname, 'src')));

// Ruta principal que sirve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Escuchar en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
