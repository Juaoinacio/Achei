# Imagem Node.js oficial estável baseada em Debian Slim (ideal para compatibilidade do Prisma Engine)
FROM node:20-slim

# Instala OpenSSL necessário para o Prisma Engine rodar no Linux
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia definições de pacotes e schema do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências (incluindo devDependencies para build e seeds com tsx)
RUN npm install

# Gera o client do Prisma para o ambiente Linux
RUN npx prisma generate

# Copia todo o código fonte da API
COPY . .

# Compila o TypeScript para JavaScript na pasta dist/
RUN npm run build

# Expõe a porta padrão da API
EXPOSE 3333

# Comando padrão de inicialização (orquestrado pelo docker-compose)
CMD ["node", "dist/server.js"]
