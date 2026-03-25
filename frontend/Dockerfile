FROM node:20-alpine AS builder

WORKDIR /app

# Kopiere Package-Dateien und installiere Dependencies
COPY package*.json ./
RUN npm install

# Kopiere den restlichen Code und baue die Anwendung
COPY . .
RUN npm run build

# Produktions-Image mit NGINX um das gebaute Frontend auszuliefern
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]