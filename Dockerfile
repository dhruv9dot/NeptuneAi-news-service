# Dockerfile

FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends sudo \
    && echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R node:node /app
USER node

CMD ["node", "src/index.js"]

