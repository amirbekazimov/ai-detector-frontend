# --- Стадия 1: сборка ---
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и lockfile
COPY package*.json ./

RUN npm ci

COPY . .

# Собираем Vite (dist/)
RUN npm run build


# --- Стадия 2: запуск ---
FROM node:20-alpine AS runner

WORKDIR /app

# Устанавливаем только "serve" для раздачи статики
RUN npm install -g serve

# Копируем билд из builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]