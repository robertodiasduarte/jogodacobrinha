const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Servir arquivos estáticos da pasta public
app.use(express.static('public'));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Jogo da Cobrinha - Use as setas do teclado para jogar!');
});
