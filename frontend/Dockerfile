# --- Build ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Variable Vite injectée AU BUILD (Vite l'inline dans le bundle).
# Dans Coolify : déclarer cette clé comme "Build Variable".
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Serve (nginx, fallback SPA) ---
FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
