# JobPop - Руководство по развертыванию

## 🚀 Быстрый старт

### Предварительные требования

- Node.js (версия 16 или выше)
- MongoDB (локально или MongoDB Atlas)
- npm или pnpm

### 1. Настройка Backend

```bash
cd backend
npm install
cp env.example .env
```

Отредактируйте `.env` файл:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobpop

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com
```

Запустите backend:

```bash
npm start
```

### 2. Настройка Frontend

```bash
cd jobpop
npm install
```

Создайте `.env.local` файл:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

Соберите и запустите frontend:

```bash
npm run build
npm start
```

## 🌐 Развертывание на Vercel

### Frontend (Vercel)

1. Подключите репозиторий к Vercel
2. Установите переменные окружения:
   - `NEXT_PUBLIC_API_URL`: URL вашего backend API
3. Деплойте

### Backend (Railway/Heroku/Render)

1. Подключите репозиторий к выбранной платформе
2. Установите переменные окружения:
   - `PORT`: 5000
   - `NODE_ENV`: production
   - `MONGODB_URI`: ваша MongoDB строка подключения
   - `JWT_SECRET`: секретный ключ для JWT
   - `CORS_ORIGIN`: URL вашего frontend

## 🐳 Развертывание с Docker

### Dockerfile для Backend

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Dockerfile для Frontend

```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:16-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:4.4
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/jobpop?authSource=admin
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - mongodb

  frontend:
    build: ./jobpop
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## 🔧 Настройка Nginx (опционально)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Мониторинг

### Health Check Endpoints

- Backend: `GET /api/health`
- Frontend: `GET /api/health` (если настроен)

### Логирование

Backend использует console.log для логирования. В продакшене рекомендуется настроить:

- Winston для структурированного логирования
- Sentry для отслеживания ошибок
- PM2 для управления процессами

## 🔒 Безопасность

### Обязательные настройки для продакшена:

1. **JWT Secret**: Используйте криптографически стойкий секретный ключ
2. **CORS**: Настройте только разрешенные домены
3. **Rate Limiting**: Настроено по умолчанию
4. **Helmet**: Настроено для безопасности заголовков
5. **MongoDB**: Используйте аутентификацию и SSL

### Переменные окружения для продакшена:

```env
NODE_ENV=production
JWT_SECRET=your-very-secure-jwt-secret-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/jobpop
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Автоматическое развертывание

### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Команды для деплоя backend
          
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Команды для деплоя frontend
```

## 📝 Чек-лист для деплоя

- [ ] Backend запущен и доступен
- [ ] Frontend собран и запущен
- [ ] MongoDB подключена и работает
- [ ] Переменные окружения настроены
- [ ] CORS настроен правильно
- [ ] SSL сертификаты установлены
- [ ] Домен настроен
- [ ] Мониторинг настроен
- [ ] Резервное копирование настроено

## 🆘 Устранение неполадок

### Частые проблемы:

1. **CORS ошибки**: Проверьте настройки CORS_ORIGIN
2. **MongoDB подключение**: Проверьте строку подключения
3. **JWT ошибки**: Проверьте JWT_SECRET
4. **Порт занят**: Измените порт в конфигурации

### Логи для отладки:

```bash
# Backend логи
cd backend && npm start

# Frontend логи
cd jobpop && npm run dev
```

## 📞 Поддержка

Если у вас возникли проблемы с развертыванием, создайте issue в репозитории или свяжитесь с командой разработки.
