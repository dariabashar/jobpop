# JobPop - Setup Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm
- MongoDB Atlas account

## 📋 Step-by-Step Setup

### 1. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Free tier is sufficient)

2. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Select "Read and write to any database"
   - Click "Add User"

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

4. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### 2. Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env file with your MongoDB credentials
   # Replace <db_username> and <db_password> with your actual credentials
   ```

4. **Test MongoDB connection**
   ```bash
   npm run test:connection
   ```

5. **Initialize database with sample data**
   ```bash
   npm run init-db
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd jobpop
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the frontend server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@jobpopcluster.ho67r6v.mongodb.net/?retryWrites=true&w=majority&appName=jobpopcluster
MONGODB_URI_PROD=mongodb+srv://<db_username>:<db_password>@jobpopcluster.ho67r6v.mongodb.net/?retryWrites=true&w=majority&appName=jobpopcluster

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d

# Optional: Cloudinary for file uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Stripe for payments
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Optional: Email for notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🧪 Testing

### Test Credentials

After running `npm run init-db`, you can use these test accounts:

- **Employer**: `employer@example.com` / `password123`
- **Worker**: `worker@example.com` / `password123`
- **Admin**: `admin@jobpop.com` / `admin123`

### API Testing

1. **Health Check**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Test Authentication**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"worker@example.com","password":"password123"}'
   ```

## 🚀 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with MongoDB
- `npm run dev:mock` - Start mock server (no database required)
- `npm run test:connection` - Test MongoDB connection
- `npm run init-db` - Initialize database with sample data
- `npm start` - Start production server

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## 📱 Application Features

### For Workers
- Browse available jobs
- Apply for jobs
- Track applications
- Manage profile
- View earnings
- Chat with employers

### For Employers
- Post job listings
- Review applications
- Manage workers
- Process payments
- View analytics

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## 🗄️ Database Schema

### Users
- Basic info (name, email, phone)
- Profile details (bio, skills, location)
- Verification status
- Wallet balance
- Payment methods

### Jobs
- Job details (title, description, category)
- Payment information
- Location and timing
- Requirements
- Status tracking

### Applications
- Job and applicant references
- Application status
- Messages
- Timestamps

### Transactions
- Payment tracking
- Withdrawal history
- Status management

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check credentials in .env file
   - Verify network access settings
   - Ensure cluster is running

2. **Frontend Build Errors**
   - Use `--legacy-peer-deps` flag
   - Clear node_modules and reinstall

3. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in .env

### Getting Help

1. Check the console logs for error messages
2. Verify all environment variables are set
3. Test MongoDB connection separately
4. Ensure both servers are running

## 📈 Next Steps

### Production Deployment
1. Set up production MongoDB cluster
2. Configure environment variables
3. Set up reverse proxy (Nginx)
4. Configure SSL certificates
5. Set up monitoring and logging

### Additional Features
1. Email notifications
2. Push notifications
3. File uploads (Cloudinary)
4. Payment processing (Stripe)
5. Real-time chat (Socket.IO)
6. Mobile app development

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with the provided sample data
4. Verify all setup steps are completed

---

**JobPop** - Connecting people with opportunities! 🚀
