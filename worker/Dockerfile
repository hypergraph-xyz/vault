FROM node:12-alpine

WORKDIR /usr/app

RUN apk add make g++ python2 git libtool autoconf automake
COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .

RUN npm install -g pm2
ENV NODE_ENV=production
ENV SWARM_PORT=1000
EXPOSE 1000

CMD ["pm2-runtime", "bin/worker.js"]