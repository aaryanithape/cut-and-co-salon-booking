FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js ./server.js
COPY public ./public

EXPOSE 3000
CMD ["node", "server.js"]
