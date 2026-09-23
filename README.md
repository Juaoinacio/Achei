# 🏫 Achei - Achados e Perdidos Universitário

Plataforma colaborativa de **achados e perdidos** desenvolvida para o ecossistema universitário, com **dinâmica, visual e usabilidade inspirados em redes sociais**.

---

## 🎯 Visão do Projeto

O objetivo principal do **Achei** é transformar a experiência de achar e devolver pertences no campus em algo leve, amigável e rápido. Em vez de uma ferramenta burocrática e engessada de formulários, o projeto adota o formato de **rede social comunitária**, aproveitando que a comunidade acadêmica está conectada a todo instante, tanto pelo celular quanto pelo computador.

### 💡 Pilares com "Cara de Rede Social":
- **Feed Interativo & Visual:** Navegação em feed (estilo timeline) com cards dinâmicos para itens perdidos e encontrados, priorizando fotos, títulos claros e tags de localização.
- **Engajamento Comunitário:** Alunos e funcionários podem colaborar com dicas e comentários rápidos nos posts (ex: *"vi na mesa da biblioteca no 2º andar"*).
- **Postagem Rápida:** Criar um aviso de item perdido ou achado em poucos passos diretamente pelo smartphone com fotos e local.
- **Experiência Híbrida (Mobile & Desktop):** Desenvolvido com foco **Mobile-First** para quem circula pelos blocos e salas com o celular na mão, mas com visual expansivo e confortável para desktops (laboratórios, notebooks e bibliotecas).
- **Status em Tempo Real:** Badges visuais indicando se o item ainda está pendente ou se já foi recuperado com sucesso.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - [Next.js](https://nextjs.org/) (App Router, TypeScript)
  - [Tailwind CSS](https://tailwindcss.com/) (Estilização responsiva e ágil)
- **Backend:**
  - [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/) (TypeScript)
  - Validações com [Zod](https://zod.dev/) e suporte a CORS/Dotenv

---

## 📁 Estrutura de Pastas

```text
Achei/
├── backend/                       # API Node.js + Express + TypeScript
│   ├── agents/                    # Instruções, personas e prompts de agentes para o backend
│   ├── docs/                      # Especificações, planos e contratos de API
│   ├── src/
│   │   ├── config/                # Variáveis de ambiente e configurações
│   │   ├── controllers/           # Controladores de requisições HTTP
│   │   ├── middlewares/           # Middlewares (autenticação, validação, erros)
│   │   ├── models/                # Entidades e modelos de dados
│   │   ├── repositories/          # Camada de comunicação com dados/ORM
│   │   ├── routes/                # Definição dos endpoints da API
│   │   ├── services/              # Regras de negócio da aplicação
│   │   ├── types/                 # Interfaces e tipagens TypeScript
│   │   ├── utils/                 # Funções auxiliares
│   │   └── server.ts              # Ponto de entrada do servidor Express
│   ├── .env                       # Variáveis locais
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # Aplicação Web Next.js + Tailwind CSS
│   ├── agents/                    # Instruções, personas e prompts de agentes para o frontend
│   ├── docs/                      # Specs de Design System, wireframes e fluxos
│   ├── src/
│   │   ├── app/                   # Rotas e páginas (Next.js App Router)
│   │   ├── components/
│   │   │   ├── common/            # Componentes estruturais (Navbar, Bottom Bar mobile, Footer)
│   │   │   └── ui/                # Base do Design System (Feed Cards, Buttons, Inputs, Badges)
│   │   ├── hooks/                 # Custom React Hooks
│   │   ├── services/              # Integração e chamadas à API
│   │   ├── types/                 # Definições de tipos do frontend
│   │   └── utils/                 # Funções utilitárias e helpers visuais
│   ├── package.json
│   └── postcss.config.mjs
│
├── .gitignore                     # Ignora node_modules, builds e .env
└── README.md                      # Documentação central do projeto
```

---

## 🚀 Como Executar o Projeto

### 1. Backend:
```bash
cd backend
npm run dev
```
> Disponível em: `http://localhost:3333`

### 2. Frontend:
```bash
cd frontend
npm run dev
```
> Disponível em: `http://localhost:3000`
