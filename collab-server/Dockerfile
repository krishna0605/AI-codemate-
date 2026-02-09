FROM node:20-alpine

WORKDIR /app

COPY collab-server/package*.json ./

RUN npm ci --only=production --ignore-scripts

COPY collab-server/ .

EXPOSE 4000

CMD ["node", "server.js"]
