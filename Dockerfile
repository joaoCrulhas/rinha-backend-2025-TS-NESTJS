#FROM node:20 AS builder
#WORKDIR /app
#
#COPY package.json package-lock.json* ./
#
#RUN npm install
#
#RUN npm install sqlite3 --save
#
#COPY . .
#
#RUN npm run build
#
#FROM node:20 AS production
#WORKDIR /app
#
#COPY --from=builder /app/node_modules ./node_modules
#COPY --from=builder /app/dist ./dist
#COPY package.json ./
#
#
#RUN npm install --omit=dev --ci --ignore-scripts
#
#EXPOSE 3000
#
#CMD ["npm", "run", "start:prod"]



# Dockerfile

# --- Estágio de Build (Focado Apenas na Compilação do NestJS) ---
# Usamos a imagem base do Node.js (Debian)
FROM node:20 AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de dependência
# Precisamos das devDependencies para compilar o NestJS
COPY package.json package-lock.json ./

# Instala TODAS as dependências para que o 'npm run build' funcione
# (incluindo devDependencies como TypeScript e ferramentas do Nest CLI)
RUN npm install --ci

# Copia o restante do código da aplicação
COPY . .

# Compila a aplicação NestJS para JavaScript puro
RUN npm run build

# --- Estágio de Produção (Focado em Rodar a Aplicação Otimizada) ---
# Usamos a mesma imagem Node.js para garantir compatibilidade de binários
FROM node:20 AS production

# Define o diretório de trabalho
WORKDIR /app

# **Passo 1: Instalar ferramentas de build temporárias para módulos nativos**
# Mesmo em imagens Debian, é uma boa prática garantir que GCC, Make, Python e Git estejam presentes
# para compilar módulos nativos como sqlite3. 'git' é necessário para algumas dependências.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    git \
    && rm -rf /var/lib/apt/lists/* # Limpa o cache para reduzir tamanho da imagem

# **Passo 2: Copiar apenas o 'dist' e 'package.json' do estágio de build**
# Não copiamos node_modules daqui, vamos instalá-los novamente no estágio de produção.
COPY --from=builder /app/dist ./dist
COPY package.json ./

# **Passo 3: Instalar SOMENTE as dependências de produção neste estágio**
# Isso garante que sqlite3 (e outros nativos) sejam compilados corretamente para o ambiente final.
# O '--ci' garante que o lockfile seja respeitado.
# NÃO usamos --ignore-scripts aqui, pois precisamos que os scripts de pós-instalação do sqlite3 rodem.
RUN npm install --omit=dev --ci

# **Passo 4: Limpar as ferramentas de build para reduzir o tamanho da imagem final**
RUN apt-get purge -y --auto-remove \
    build-essential \
    python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Expõe a porta que sua aplicação NestJS Fastify vai escutar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
