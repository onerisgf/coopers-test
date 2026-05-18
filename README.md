# Coopers Full Stack Challenge

Projeto desenvolvido para avaliação Full Stack Developer.

## Links

- Projeto online: https://coopers-test-lyart.vercel.app
- API: https://coopers-test-api.onrender.com

## Tecnologias

### Front-end
- React
- Vite
- JavaScript
- CSS puro
- React Router DOM
- DnD Kit

### Back-end
- Node.js
- Express
- Prisma
- PostgreSQL Neon
- JWT
- bcryptjs
- Nodemailer
- Mailtrap

## Funcionalidades

- Cadastro de usuário
- Login com JWT
- Rota protegida
- To-do list vinculada ao usuário logado
- Criar, editar, excluir e concluir tarefas
- Reordenar tarefas com drag and drop
- Limpar tarefas por status
- Carrossel horizontal na seção Good Things
- Formulário de contato com envio de e-mail
- Layout responsivo

## Como rodar localmente

### Back-end

```bash
cd server
npm install
npx prisma generate
npm run dev
```

### Front-end

```bash
cd client
npm install
npm run dev
```
Variáveis de ambiente

server/.env

DATABASE_URL=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
MAIL_TO=
FRONTEND_URL=

client/.env

VITE_API_URL=

Processo de desenvolvimento

A aplicação foi dividida em front-end e back-end para manter responsabilidades separadas. O back-end centraliza autenticação, persistência das tarefas e envio de e-mails. O front-end consome a API, mantém o usuário autenticado e protege a rota da to-do list.

A principal decisão técnica foi manter uma stack enxuta para garantir uma entrega funcional dentro do prazo, priorizando React, Express, Prisma e PostgreSQL online. O drag and drop foi implementado apenas na coluna de tarefas pendentes para atender ao requisito de reordenação de prioridades sem adicionar complexidade desnecessária.
