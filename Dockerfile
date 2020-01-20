FROM node:12-alpine

WORKDIR /usr/app

RUN apk add python make git openssh
COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .

RUN npm install -g pm2
EXPOSE 80
ENV PORT=80
ENV VAULT_URL=https://vault.hypergraph.xyz
CMD ["pm2-runtime", "bin/vault.js"]