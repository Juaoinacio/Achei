# Especificação de Armazenamento de Arquivos e Imagens — Cloudinary

Documento de arquitetura técnica para o gerenciamento, upload, otimização e entrega de arquivos e imagens na plataforma **Achei Unochapecó** utilizando o serviço de nuvem **Cloudinary**.

---

## 1. Visão Geral e Motivação

O **Cloudinary** foi selecionado como o provedor oficial de armazenamento em nuvem para todas as mídias da aplicação. 

### Benefícios para o Achei Unochapecó:
* **Zero Carga no Servidor Local:** Nenhuma imagem física é salva no disco do servidor Express/Node.js, mantendo a aplicação totalmente *stateless* e escalável.
* **Otimização Automática (`f_auto, q_auto`):** Converte automaticamente imagens para formatos modernos e ultraleves (**WebP / AVIF**) conforme o navegador do usuário, reduzindo o consumo de dados móveis no campus da faculdade.
* **CDN Global com HTTPS:** Entrega rápida de imagens com alta disponibilidade e cache na borda.
* **Transformações Dinâmicas sob Demanda:** Permite redimensionar avatares, aplicar cortes inteligentes focados em rostos (`g_face`) e ajustar proporções de fotos dos itens sem reprocessar manualmente os arquivos.

---

## 2. Estrutura de Pastas no Cloudinary

Todos os uploads do projeto serão agrupados sob o diretório raiz institucional `achei-unochapeco`:

```
achei-unochapeco/
├── items/                  # Fotos de pertences perdidos e achados
│   └── item_{id}_{timestamp}
├── avatars/                # Fotos de perfil dos alunos e funcionários
│   └── avatar_{userId}_{timestamp}
└── banners/                # Imagens de capa de perfil personalizadas (banerUrl)
    └── banner_{userId}_{timestamp}
```

---

## 3. Diretrizes de Transformação por Tipo de Imagem

| Entidade / Campo | Pasta Cloudinary | Transformações Padrão | Dimensões / Aspecto |
| :--- | :--- | :--- | :--- |
| `Item.photoUrl` | `achei-unochapeco/items/` | `f_auto,q_auto,w_900,c_limit` | Max 900px de largura, preservando proporção original para não distorcer o pertence. |
| `User.avatarUrl` | `achei-unochapeco/avatars/` | `c_thumb,g_face,w_200,h_200,f_auto,q_auto` | Corte quadrado 1:1 focado no rosto com 200x200px. |
| `User.banerUrl` | `achei-unochapeco/banners/` | `c_fill,w_1200,h_400,f_auto,q_auto` | Proporção 3:1 panorâmica para cabeçalhos de perfil desktop e mobile. |

---

## 4. Variáveis de Ambiente Necessárias (`backend/.env`)

Para autenticação segura com a API do Cloudinary, as seguintes credenciais devem ser configuradas:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
CLOUDINARY_URL="cloudinary://<api_key>:<api_secret>@<cloud_name>"
```

---

## 5. Fluxo de Upload e Segurança

1. **Autenticação Obrigatória:** Apenas acadêmicos e funcionários autenticados (com token JWT válido) têm autorização para submeter fotos.
2. **Validação de Tipos MIME:** São permitidos apenas arquivos de imagem nos formatos:
   * `image/jpeg` (`.jpg`, `.jpeg`)
   * `image/png` (`.png`)
   * `image/webp` (`.webp`)
3. **Limite de Tamanho:**
   * Fotos de pertences: até **5 MB**
   * Fotos de perfil/avatar: até **3 MB**
   * Banners de capa: até **5 MB**
4. **Remoção de Arquivos:** Quando um usuário altera seu avatar/banner ou exclui um post ativo, o backend agenda a exclusão da mídia antiga no Cloudinary (`cloudinary.uploader.destroy(public_id)`) para evitar lixo em nuvem.
