# 🎨 Manual de Identidade Visual & Design System — Achei

> **Achei — Achados e Perdidos Universitário**  
> *Identidade visual contemporânea para a comunidade acadêmica da **Unochapecó**.*  
> **Tipografia Oficial:** `Plus Jakarta Sans` | **Estilo:** *Clean Tech & Soft UI* (cantos moderados de 10px a 12px)

---

## 1. 🌈 Paleta de Cores Oficial (5 Cores Definidas)

A paleta oficial é composta pelas 5 cores selecionadas para equilibrar autoridade universitária, dinamismo social e alto contraste:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  Azul Royal      Roxo Lilás      Amarelo Solar     Grafite Escuro     Cinza Claro      │
│   #1C4398          #AC80CE          #FFDC5D           #232724           #E1E1E1        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| Amostra | Nome do Token | Hexadecimal | Papel no Design |
| :---: | :--- | :--- | :--- |
| 🟦 | **Azul Royal (`brand-blue`)** | `#1C4398` | Cor institucional forte. Utilizada na barra de navegação superior, cabeçalhos e botões de destaque. |
| 🟪 | **Roxo Lilás (`brand-lilac`)** | `#AC80CE` | Acento moderno de rede social. Traz harmonia e contraste refinado com o amarelo solar. |
| 🟨 | **Amarelo Solar (`brand-yellow`)** | `#FFDC5D` | Cor de energia e foco. Aplicada no botão de ação principal **"+ Novo Post"** e notificações de pistas. |
| ⬛ | **Grafite Escuro (`brand-dark`)** | `#232724` | Tipografia principal, títulos, textos de leitura e elementos escuros com alto contraste. |
| ⬜ | **Cinza Claro (`brand-gray`)** | `#E1E1E1` | Linhas, bordas sutis dos cards, divisórias e fundos de campos de busca. |
| 📄 | **Branco Puro (`brand-surface`)** | `#FFFFFF` | Superfície dos cards do feed, modais e caixas de diálogo sobre o fundo neutro. |

---

## 2. ✍️ Tipografia Oficial: `Plus Jakarta Sans`

Aprovada como a tipografia oficial do projeto por aliar modernidade geométrica, legibilidade excelente em telas de smartphone e ar de produto digital de ponta.

- **Display / H1:** 48px | Bold (700)
- **Subtítulos / H2:** 24px | SemiBold (600)
- **Corpo de Texto (Body):** 16px | Medium (500)
- **Legendas & Chips (Caption):** 14px | Regular (400)

---

## 3. 📐 Padrão de Componentes & Formas (Sem Arredondamento Excessivo)

- **Raio de Borda:** Moderado e limpo (`rounded-xl` / 10px a 12px para cards e botões; 8px para inputs). Nada de botões em formato de cápsula exagerada ou cantos muito redondos.
- **Botões:**
  - **Ação Principal:** Fundo Amarelo Solar (`#FFDC5D`) com texto em peso bold em Grafite Escuro (`#232724`).
  - **Ação Secundária:** Fundo Azul Royal (`#1C4398`) com texto branco ou Roxo Lilás (`#AC80CE`).
- **Badges de Status:** Puramente tipográficas, **sem ícones ou emojis**, com texto em caixa alta e tracking aberto (`uppercase font-bold tracking-wide`), garantindo visual sóbrio, limpo e direto.
- **Cards do Feed:** Superfície branca (`#FFFFFF`), borda sutil em Cinza Claro (`#E1E1E1`), cantos de 10px-12px e sombra suave (`shadow-sm`).

---

## 4. 🔣 Sistema Oficial de Ícones: `Boxicons v2`

Todos os ícones da aplicação utilizam a biblioteca [Boxicons v2](https://boxicons.com/), instalada nativamente no projeto (`npm install boxicons`).

### Ícones Mapeados por Contexto:
- **Navegação:** `bx-home-alt-2` (Feed), `bx-compass` (Explorar), `bxs-plus-circle` (Novo Post), `bx-bell` (Notificações), `bx-user` (Perfil).
- **Ações & Interação:** `bx-search` (Busca), `bx-map-pin` (Local/Bloco), `bx-message-dots` (Pistas), `bx-share-alt` (Compartilhar), `bx-camera` (Foto), `bx-check-shield` (Devolvido).
- **Categorias:** `bx-devices` (Eletrônicos), `bx-id-card` (Documentos/Crachás), `bx-key` (Chaves), `bx-book-open` (Cadernos), `bx-glasses` (Óculos), `bx-closet` (Casacos).
