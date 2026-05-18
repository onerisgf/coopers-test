const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const contactRoutes = require('./routes/contactRoutes');
const app = express();

// Libera o acesso do front-end local à API.
// Em produção, essa URL deve ser substituída pela URL real do front-end.
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Permite que a API receba dados em JSON no corpo das requisições.
app.use(express.json());

// Rota simples para validar se a API está online.
app.get('/health', (req, res) => {
  res.json({ message: 'API running' });
});

// Agrupa todas as rotas de autenticação sob o prefixo /auth.
app.use('/auth', authRoutes);

// Agrupa as rotas privadas da to-do list sob o prefixo /tasks.
app.use('/tasks', taskRoutes);

// Rota pública responsável pelo envio de e-mail do formulário de contato.
app.use('/contact', contactRoutes);

module.exports = app;