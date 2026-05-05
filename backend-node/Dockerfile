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

# Beim Starten: Migrationen ausführen (mit --accept-data-loss), dann Server starten
CMD ["sh", "-c", "if [ \"$(ls -A ./prisma/migrations 2>/dev/null | wc -l)\" -eq 0 ]; then npx prisma db push; else npx prisma migrate deploy; fi && npm run start"]