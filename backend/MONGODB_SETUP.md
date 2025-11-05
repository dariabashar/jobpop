# Настройка MongoDB Atlas

## Шаг 1: Создание аккаунта
1. Перейдите на https://www.mongodb.com/atlas
2. Нажмите "Try Free"
3. Заполните форму регистрации

## Шаг 2: Создание кластера
1. Выберите "Free" план (M0)
2. Выберите провайдера (AWS/Google Cloud/Azure)
3. Выберите регион (ближайший к вам)
4. Нажмите "Create"

## Шаг 3: Настройка пользователя базы данных
1. В левом меню перейдите в "Database Access"
2. Нажмите "Add New Database User"
3. Username: `jobpop_user`
4. Password: `jobpop_password123`
5. Role: `Read and write to any database`
6. Нажмите "Add User"

## Шаг 4: Настройка сетевого доступа
1. В левом меню перейдите в "Network Access"
2. Нажмите "Add IP Address"
3. Нажмите "Allow Access from Anywhere" (0.0.0.0/0)
4. Нажмите "Confirm"

## Шаг 5: Получение строки подключения
1. Нажмите "Connect" на кластере
2. Выберите "Connect your application"
3. Скопируйте строку подключения

## Шаг 6: Настройка проекта
1. Создайте файл `.env` в папке `backend/`
2. Добавьте следующее содержимое:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://jobpop_user:jobpop_password123@cluster0.xxxxx.mongodb.net/jobpop?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Важно:** Замените `cluster0.xxxxx.mongodb.net` на вашу реальную строку подключения из MongoDB Atlas.

## Шаг 7: Запуск сервера
```bash
cd backend
npm run dev
```

## Проверка подключения
После запуска сервера вы должны увидеть:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 3001 in development mode
```

## Альтернатива: Локальная установка MongoDB

Если хотите установить MongoDB локально:

1. Обновите Command Line Tools:
```bash
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```

2. Установите MongoDB:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

3. Запустите MongoDB:
```bash
brew services start mongodb/brew/mongodb-community
```

4. Используйте локальную строку подключения:
```env
MONGODB_URI=mongodb://localhost:27017/jobpop
``` 