FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "node -e \"const net = require('net'); const check = () => { const s = net.connect(Number(process.env.DB_PORT || 5432), process.env.DB_HOST || 'postgres', () => { s.end(); process.exit(0); }); s.on('error', () => setTimeout(check, 1000)); }; check();\" && npm run migration:run:prod && node dist/src/main"]
