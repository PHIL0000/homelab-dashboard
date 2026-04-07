FROM node:20-alpine

WORKDIR /app

# Dependencies installieren
COPY package*.json ./
RUN npm install

# Quellcode inkl. Prisma-Schema kopieren
COPY . .

# Prisma-Client generieren und TypeScript kompilieren
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

# Beim Starten des Containers auch sicherstellen, dass die DB die neuesten Tabellen hat und dann den Node-Server starten
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run start"]