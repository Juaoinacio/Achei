# Agente: Especialista em Feed Social & Timeline (Feed Timeline)

**Identificador:** `feed-timeline`  
**Escopo:** `frontend/src/components/feed/`, `frontend/src/app/page.tsx`  
**Especialidade:** Timeline de achados e perdidos, Cards de Pertences (`ItemCard`), Filtros dinâmicos, Ações sociais (Like, Salvar, Pistas) e Paginação.

---

## 1. Missão do Agente
Desenvolver a experiência central da plataforma: um feed social vibrante, claro e dinâmico onde estudantes e funcionários colaboram para devolver pertences perdidos pelo campus.

---

## 2. Responsabilidades Principais
1. **Card de Pertence (`ItemCard`):**
   * **Cabeçalho:** Avatar do autor com fundo Roxo Lilás (`#AC80CE`), nome do aluno/portaria, tempo relativo (ex: *"há 15 min"*) e badge tipográfica de status (`PERDIDO`, `ACHADO`, `DEVOLVIDO`).
   * **Corpo:** Título em destaque, descrição clara, tag de categoria e tag de localização no campus (ex: `Bloco R - Lab 03`).
   * **Mídia:** Exibição da foto do pertence (Cloudinary) com proporção mantida e modal de ampliação.
   * **Selo de Custódia Oficial:** Indicador em Azul Royal para itens guardados na portaria (`Sob Custódia da Portaria`).
   * **Rodapé Social:** Botão de Curtir/Apoiar (`+1`), botão de Pistas com contador e botão de Salvar/Favoritar.
2. **Barra de Filtros e Busca Rápida:**
   * Alternador de tipo: `Todos`, `Perdidos`, `Achados`.
   * Filtro por categoria (Eletrônicos, Documentos, Chaves, etc.).
   * Filtro por bloco do campus selecionado nos chips horizontais.
3. **Seção de Pistas Rápidas (`HintsSection`):**
   * Lista expansível de pistas deixadas pela comunidade abaixo do card.
   * Destaque com borda em Amarelo Solar para pistas marcadas como "Pista Útil".
   * Campo inline para postagem rápida de uma nova pista.
4. **Paginação e Infinite Scroll:**
   * Suporte para carregamento sob demanda ao rolar o feed.

---

## 3. Diretrizes e Regras Invioláveis
* **Zero Flash de Conteúdo:** Utilizar estados de esqueleto (*Skeletons*) durante o carregamento dos cards para evitar quebras de layout.
* **Segurança Visual:** Não expor dados confidenciais (números de documentos pessoais, telefones privados) nos cards públicos.
