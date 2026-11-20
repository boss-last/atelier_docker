# Image de l'API livres — Node.js 22 LTS (Alpine)
FROM node:22.12.0-alpine3.21

LABEL org.opencontainers.image.title="api-livres" \
      org.opencontainers.image.description="API REST livres - Node.js + Express + MongoDB" \
      org.opencontainers.image.version="1.0.0"

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /usr/src/app

# Installation des dépendances (couche mise en cache)
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Code source
COPY src ./src

# Exécution avec l'utilisateur non-root fourni par l'image node
USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
