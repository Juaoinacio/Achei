# Especificação de Requisitos e Regras de Negócio — Achei Unochapecó

Documento de especificação técnica e funcional para a plataforma colaborativa de achados e perdidos da comunidade acadêmica da **Unochapecó**.

---

## 1. Requisitos Funcionais (RF)

### 1.1 Módulo de Usuários e Autenticação
* **RF01:** O sistema deve permitir que novos usuários realizem cadastro utilizando obrigatoriamente um e-mail com domínio institucional (`@unochapeco.edu.br`).
* **RF02:** O sistema deve autenticar usuários por meio de e-mail institucional e senha com geração de token seguro de sessão.
* **RF03:** O sistema deve fornecer fluxo de recuperação de senha com envio de token/link temporário para o e-mail cadastrado, expirando em 30 minutos.
* **RF04:** O sistema deve permitir a consulta e edição dos dados cadastrais e visuais do usuário (nome completo, curso, período, foto de avatar, imagem de capa/banner do perfil `banerUrl` e múltiplos blocos do campus que frequenta para filtragem de feed e alertas personalizados).
* **RF05:** O sistema deve suportar papéis (*roles*) com permissões diferenciadas:
  * `ALUNO`: Usuário padrão da comunidade acadêmica.
  * `PORTARIA`: Perfil institucional autorizado a manter itens sob custódia oficial e registrar entregas em portarias/secretarias.
  * `ADMIN`: Moderação geral, gerenciamento de denúncias e relatórios.

### 1.2 Módulo de Publicações (Achados e Perdidos)
* **RF06:** O sistema deve permitir a criação de publicações para pertences com status inicial `PERDIDO` ou `ACHADO`.
* **RF07:** A publicação deve registrar obrigatoriamente:
  * Título resumido do pertence;
  * Descrição detalhada;
  * Categoria (Eletrônicos, Documentos, Chaves, Cadernos/Livros, Vestuário, Outros);
  * Bloco do campus (ex: Bloco R, Bloco G, Bloco B, Biblioteca Central, Cantina Central, Portaria, etc.);
  * Sala/laboratório ou ponto de referência (opcional);
  * Foto do pertence (armazenamento e exibição de imagem).
* **RF08:** Para itens com status `ACHADO`, o sistema deve permitir sinalizar se o item está em mãos do próprio aluno ou se foi entregue para a custódia de uma portaria/setor oficial.
* **RF09:** O sistema deve listar o feed cronológico de publicações ativas com filtros por:
  * Tipo (`Todos`, `Perdidos`, `Achados`);
  * Bloco do campus;
  * Categoria de pertence.
* **RF10:** O sistema deve fornecer busca textual para filtragem por palavras-chave em títulos, descrições e localizações.
* **RF11:** O sistema deve permitir que o autor edite os dados do item ou exclua a publicação enquanto ela não estiver resolvida.

### 1.3 Módulo de Interação Social e Pistas
* **RF12:** O sistema deve permitir que usuários autenticados publiquem comentários do tipo **"Pistas"** em publicações ativas para indicar o paradeiro de um item.
* **RF13:** O sistema deve permitir que usuários apoiem/curtam publicações para aumentar o engajamento comunitário.
* **RF14:** O autor de uma publicação de item perdido deve poder marcar uma pista específica como **"Pista Útil"**.
* **RF15:** O sistema deve permitir que o usuário adicione publicações à sua lista de **"Itens Salvos"** para acompanhamento.

### 1.4 Módulo de Devolução e Encerramento de Casos
* **RF16:** O sistema deve permitir que o proprietário legítimo reivindique um item achado através de uma solicitação de retirada (*"É meu! / Retirar"*).
* **RF17:** O sistema deve permitir que quem localizou um item perdido avise o dono (*"Encontrei! / Avisar"*).
* **RF18:** O sistema deve permitir a conclusão formal da devolução, alterando o status do item para `DEVOLVIDO`.
* **RF19:** O sistema deve arquivar casos devolvidos e exibi-los no mural de prova social e agradecimento comunitário.

### 1.5 Módulo de Ranking Comunitário e Gamificação
* **RF20:** O sistema deve gerar e exibir o Ranking Comunitário dividido em três categorias:
  1. **Mais Devolveram:** Usuários e portarias com maior número de casos resolvidos.
  2. **Mais Acharam:** Usuários com mais publicações de itens achados registradas.
  3. **Mais Perderam:** Estatística empática dos estudantes mais distraídos que necessitam de apoio.
* **RF21:** O sistema deve permitir a filtragem temporal do ranking por: *Este Mês*, *Semestre Vigente* e *Geral (Histórico)*.
* **RF22:** O sistema deve exibir a posição individual do usuário autenticado no ranking.
* **RF23:** O sistema deve conceder selos comunitários de reputação aos usuários conforme metas atingidas (*Guardião de Ouro*, *Detetive de Pistas*, *Rei da Distração*).

---

## 2. Regras de Negócio (RN)

* **RN01 — Exclusividade Institucional:** Apenas e-mails com domínio institucional `@unochapeco.edu.br` têm permissão para criar contas e interagir na plataforma.
* **RN02 — Imutabilidade de Caso Devolvido:** Uma vez que um item for marcado e confirmado com o status `DEVOLVIDO`, sua publicação torna-se imutável e não pode ser revertida para `PERDIDO` ou `ACHADO`.
* **RN03 — Proteção contra Retirada Fraudulenta:** Na publicação de itens de alto valor achados (carteiras, notebooks, celulares), a descrição pública deve omitir características particulares sigilosas (conteúdo interno, papel de parede, chaveiros ocultos), as quais devem ser exigidas como pergunta de comprovação de posse no momento da entrega.
* **RN04 — Custódia Oficial de Portaria:** Itens entregues formalmente para portarias ou secretarias recebem um selo oficial de custódia e só podem ter a baixa de devolução efetuada pelo operador institucional responsável do setor ou mediante código seguro emitido pelo sistema.
* **RN05 — Pontuação do Ranking:**
  * Cada caso confirmado como `DEVOLVIDO`: **+10 pontos** no ranking de devoluções.
  * Cada item `ACHADO` registrado no feed: **+5 pontos** no ranking de guardiões.
  * Cada pista marcada como "Útil" pelo autor: **+2 pontos** de colaboração solidária.
  * Denúncias de falsidade comprovadas acarretam perda total de pontuação e suspensão temporária da conta.
* **RN06 — Permissão de Edição e Exclusão:** Somente o autor que criou o registro ou um administrador com privilégios tem autorização para editar ou remover uma publicação ativa.
* **RN07 — Alertas por Bloco Prioritário:** Cada usuário pode selecionar até 3 blocos prioritários de estudo para receber notificações automáticas em tempo real.

---

## 3. Requisitos Não-Funcionais (RNF)

* **RNF01 — Desempenho e Tempo de Resposta:** As consultas do feed, filtragem por blocos e cálculo do ranking devem responder em tempo inferior a **200ms** sob carga normal no campus.
* **RNF02 — Segurança de Credenciais:** As senhas dos usuários devem ser armazenadas utilizando hash criptográfico forte (`bcrypt` com fator de custo de no mínimo 10).
* **RNF03 — Autenticação Stateless:** A comunicação entre frontend e backend deve utilizar tokens JWT (*JSON Web Tokens*) com tempo de expiração curto e mecanismo de renovação via refresh tokens seguros em cookies HttpOnly.
* **RNF04 — Integridade Relacional com Prisma ORM:** O banco de dados PostgreSQL deve ser modelado no Prisma ORM garantindo integridade referencial com chaves estrangeiras, índices de busca em colunas de alta consulta (`status`, `bloco`, `created_at`, `user_id`) e transações atômicas para encerramento de devoluções.
* **RNF05 — Otimização Mobile-First:** A API REST deve fornecer respostas paginadas (por cursor ou limit/offset) e compressão de imagens para garantir consumo eficiente de dados móveis em dispositivos móveis.
* **RNF06 — Conformidade com LGPD e Privacidade:** Nenhum dado pessoal sensível (como CPF, RG, número de telefone pessoal ou endereço residencial) deve ser exposto publicamente no feed de publicações.
* **RNF07 — Disponibilidade e Desacoplamento:** O sistema deve manter arquitetura independente entre Next.js (frontend) e Express/Prisma (backend), viabilizando manutenção, testes unitários e escalabilidade contínua.
