# JobPop Backend API

Backend API для платформы JobPop - маркетплейса временных работ.

## Технологии

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL база данных
- **Mongoose** - ODM для MongoDB
- **JWT** - Аутентификация
- **Socket.IO** - Real-time коммуникация
- **bcryptjs** - Хеширование паролей
- **express-validator** - Валидация данных
- **helmet** - Безопасность
- **cors** - Cross-origin resource sharing

## Установка и запуск

### Предварительные требования

- Node.js (версия 16 или выше)
- MongoDB (локально или MongoDB Atlas)
- npm или pnpm

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd backend
```

2. Установите зависимости:
```bash
npm install
# или
pnpm install
```

3. Создайте файл `.env` на основе `env.example`:
```bash
cp env.example .env
```

4. Настройте переменные окружения в `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jobpop
JWT_SECRET=your-super-secret-jwt-key-here
```

5. Запустите сервер:
```bash
# Разработка
npm run dev

# Продакшн
npm start
```

## API Endpoints

### Аутентификация

#### POST /api/auth/register
Регистрация нового пользователя
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### POST /api/auth/login
Вход в систему
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Получение информации о текущем пользователе

#### POST /api/auth/refresh
Обновление JWT токена

### Пользователи

#### GET /api/users/profile
Получение профиля текущего пользователя

#### PUT /api/users/profile
Обновление профиля
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "location": "New York",
  "bio": "Experienced worker",
  "skills": ["Delivery", "Customer Service"]
}
```

#### GET /api/users/:id
Получение публичного профиля пользователя

#### POST /api/users/verify
Отправка документов для верификации
```json
{
  "idCardUrl": "https://example.com/id-card.jpg",
  "selfieUrl": "https://example.com/selfie.jpg",
  "businessInfo": {
    "name": "My Company",
    "registrationNumber": "123456789"
  }
}
```

### Работы

#### GET /api/jobs
Получение списка работ с фильтрами
```
?category=Delivery&city=New York&minPay=20&maxPay=100&sort=recent&page=1&limit=20
```

#### GET /api/jobs/:id
Получение информации о конкретной работе

#### POST /api/jobs
Создание новой работы
```json
{
  "title": "Food Delivery Driver",
  "description": "Deliver food orders to customers",
  "category": "Delivery",
  "pay": {
    "amount": 25,
    "currency": "USD",
    "type": "fixed"
  },
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "coordinates": [-74.006, 40.7128]
  },
  "date": "2025-01-25",
  "time": {
    "start": "14:00",
    "end": "18:00"
  },
  "duration": 4
}
```

#### PUT /api/jobs/:id
Обновление работы

#### DELETE /api/jobs/:id
Удаление работы

### Заявки

#### POST /api/applications/:jobId
Подача заявки на работу
```json
{
  "message": "I'm interested in this job",
  "proposedPay": 30
}
```

#### GET /api/applications/my
Получение заявок пользователя

#### GET /api/applications/job/:jobId
Получение заявок на работу (для работодателя)

#### PUT /api/applications/:jobId/:applicationId
Обновление статуса заявки
```json
{
  "action": "accept" // accept, reject, withdraw
}
```

### Платежи

#### GET /api/payments/wallet
Получение информации о кошельке

#### GET /api/payments/transactions
Получение истории транзакций

#### POST /api/payments/withdraw
Вывод средств
```json
{
  "amount": 100,
  "paymentMethodId": "payment_method_id"
}
```

#### POST /api/payments/add-payment-method
Добавление способа оплаты
```json
{
  "type": "card",
  "name": "Visa Card",
  "last4": "1234",
  "stripePaymentMethodId": "pm_123456789"
}
```

#### POST /api/payments/complete-job/:jobId
Завершение работы и обработка платежа

### Рейтинги

#### POST /api/ratings/:jobId
Оценка завершенной работы
```json
{
  "rating": 5,
  "review": "Great job! Very professional."
}
```

#### GET /api/ratings/job/:jobId
Получение оценок для работы

#### GET /api/ratings/user/:userId
Получение оценок пользователя

### Уведомления

#### GET /api/notifications
Получение уведомлений пользователя

#### PUT /api/notifications/:id/read
Отметить уведомление как прочитанное

#### PUT /api/notifications/read-all
Отметить все уведомления как прочитанные

#### GET /api/notifications/unread-count
Получение количества непрочитанных уведомлений

### Чат

#### GET /api/chat/conversations
Получение списка бесед

#### GET /api/chat/messages/:conversationId
Получение сообщений беседы

#### POST /api/chat/conversation
Создание новой беседы
```json
{
  "participants": ["user_id_1", "user_id_2"],
  "jobId": "job_id",
  "title": "Job Discussion"
}
```

#### POST /api/chat/message
Отправка сообщения
```json
{
  "conversationId": "conversation_id",
  "content": "Hello! I'm interested in your job."
}
```

## Модели данных

### User
```javascript
{
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  avatar: String,
  location: String,
  bio: String,
  skills: [String],
  isVerified: Boolean,
  verificationDocuments: {
    idCard: { url: String, verified: Boolean },
    selfie: { url: String, verified: Boolean },
    businessInfo: { name: String, registrationNumber: String, verified: Boolean }
  },
  wallet: {
    balance: Number,
    currency: String
  },
  paymentMethods: [{
    type: String,
    name: String,
    last4: String,
    isDefault: Boolean
  }],
  stats: {
    totalJobs: Number,
    completedJobs: Number,
    totalEarnings: Number,
    averageRating: Number,
    totalReviews: Number
  }
}
```

### Job
```javascript
{
  title: String,
  description: String,
  category: String,
  employer: ObjectId,
  companyName: String,
  pay: {
    amount: Number,
    currency: String,
    type: String
  },
  location: {
    address: String,
    city: String,
    coordinates: [Number, Number]
  },
  date: Date,
  time: {
    start: String,
    end: String
  },
  duration: Number,
  status: String,
  applications: [{
    worker: ObjectId,
    status: String,
    message: String,
    proposedPay: Number
  }],
  selectedWorker: ObjectId,
  completion: {
    startedAt: Date,
    completedAt: Date,
    workerRating: { rating: Number, review: String },
    employerRating: { rating: Number, review: String }
  }
}
```

### Transaction
```javascript
{
  user: ObjectId,
  type: String, // earned, withdrawal, refund, bonus, fee
  amount: Number,
  currency: String,
  description: String,
  reference: String,
  job: ObjectId,
  paymentMethod: ObjectId,
  status: String,
  stripePaymentIntentId: String,
  processedAt: Date
}
```

## Real-time функциональность

Сервер использует Socket.IO для real-time коммуникации:

### События

- `join-job` - присоединение к комнате работы
- `leave-job` - выход из комнаты работы
- `typing-start` - начало набора текста
- `typing-stop` - остановка набора текста
- `set-online` - установка статуса онлайн

### Подключение

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('user-typing', (data) => {
  console.log(`${data.userName} is typing...`);
});
```

## Безопасность

- JWT аутентификация
- Хеширование паролей с bcrypt
- Валидация входных данных
- Rate limiting
- CORS настройки
- Helmet для защиты заголовков

## Развертывание

### Локальное развертывание

1. Установите MongoDB локально или используйте MongoDB Atlas
2. Настройте переменные окружения
3. Запустите сервер: `npm start`

### Продакшн развертывание

1. Настройте переменные окружения для продакшна
2. Используйте PM2 или аналогичный процесс-менеджер
3. Настройте Nginx как reverse proxy
4. Используйте MongoDB Atlas для базы данных

## Тестирование

```bash
npm test
```

## Лицензия

MIT 