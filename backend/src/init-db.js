const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

// Import models
const User = require('./models/User');
const Job = require('./models/Job');
const Transaction = require('./models/Transaction');

// Sample data
const sampleUsers = [
  {
    email: 'employer@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Employer',
    phone: '+1234567890',
    location: 'New York, NY',
    bio: 'Looking for reliable workers for various projects',
    skills: ['Management', 'Project Planning'],
    isVerified: true,
    wallet: { balance: 1000, currency: 'USD' }
  },
  {
    email: 'worker@example.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Worker',
    phone: '+1234567891',
    location: 'New York, NY',
    bio: 'Experienced worker looking for opportunities',
    skills: ['Delivery', 'Customer Service', 'Food Service'],
    isVerified: true,
    wallet: { balance: 250, currency: 'USD' }
  },
  {
    email: 'admin@jobpop.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1234567892',
    location: 'New York, NY',
    bio: 'System administrator',
    skills: ['Administration'],
    isVerified: true,
    wallet: { balance: 0, currency: 'USD' }
  }
];

const sampleJobs = [
  {
    title: 'Food Delivery Driver',
    description: 'Deliver food orders in the downtown area. Must have own vehicle and smartphone.',
    category: 'Delivery',
    companyName: 'QuickEats',
    pay: { amount: 25, currency: 'USD', type: 'fixed' },
    location: {
      address: '123 Main St',
      city: 'New York',
      coordinates: { type: 'Point', coordinates: [-74.006, 40.7128] }
    },
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    time: { start: '10:00', end: '13:00' },
    duration: 3,
    requirements: {
      skills: ['Driving', 'Customer Service'],
      experience: 'beginner',
      age: { min: 18, max: 65 },
      ownVehicle: true,
      validLicense: true
    },
    status: 'active',
    isUrgent: true,
    isTrending: true
  },
  {
    title: 'Event Assistant',
    description: 'Help with setup and management of a corporate event. Good communication skills required.',
    category: 'Events',
    companyName: 'EventPro',
    pay: { amount: 20, currency: 'USD', type: 'hourly' },
    location: {
      address: '456 Business Ave',
      city: 'New York',
      coordinates: { type: 'Point', coordinates: [-74.008, 40.7140] }
    },
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    time: { start: '14:00', end: '18:00' },
    duration: 4,
    requirements: {
      skills: ['Event Management', 'Communication'],
      experience: 'intermediate',
      age: { min: 18, max: 65 },
      ownVehicle: false,
      validLicense: false
    },
    status: 'active',
    isUrgent: false,
    isTrending: true
  },
  {
    title: 'Digital Content Creator',
    description: 'Create social media content for a local restaurant. Photography and editing skills needed.',
    category: 'Digital',
    companyName: 'DigitalCraft',
    pay: { amount: 150, currency: 'USD', type: 'fixed' },
    location: {
      address: '789 Creative Blvd',
      city: 'New York',
      coordinates: { type: 'Point', coordinates: [-74.004, 40.7100] }
    },
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    time: { start: '09:00', end: '17:00' },
    duration: 8,
    requirements: {
      skills: ['Photography', 'Photo Editing', 'Social Media'],
      experience: 'intermediate',
      age: { min: 18, max: 65 },
      ownVehicle: false,
      validLicense: false
    },
    status: 'active',
    isUrgent: false,
    isTrending: false
  }
];

const sampleTransactions = [
  {
    user: null, // Will be set after user creation
    type: 'earned',
    amount: 75,
    currency: 'USD',
    description: 'Payment for Food Delivery Driver job',
    status: 'completed',
    reference: 'JOB_001_PAYMENT'
  },
  {
    user: null, // Will be set after user creation
    type: 'withdrawal',
    amount: 50,
    currency: 'USD',
    description: 'Withdrawal to bank account',
    status: 'completed',
    reference: 'WITHDRAWAL_001'
  }
];

async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Transaction.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${savedUser.email}`);
    }

    // Create jobs (assign to first user as employer)
    console.log('💼 Creating jobs...');
    const createdJobs = [];
    for (const jobData of sampleJobs) {
      const job = new Job({
        ...jobData,
        employer: createdUsers[0]._id
      });
      const savedJob = await job.save();
      createdJobs.push(savedJob);
      console.log(`✅ Created job: ${savedJob.title}`);
    }

    // Create transactions
    console.log('💰 Creating transactions...');
    for (const transactionData of sampleTransactions) {
      const transaction = new Transaction({
        ...transactionData,
        user: createdUsers[1]._id // Assign to worker
      });
      await transaction.save();
      console.log(`✅ Created transaction: ${transaction.description}`);
    }

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users created: ${createdUsers.length}`);
    console.log(`   💼 Jobs created: ${createdJobs.length}`);
    console.log(`   💰 Transactions created: ${sampleTransactions.length}`);
    
    console.log('\n🔑 Test credentials:');
    console.log('   Employer: employer@example.com / password123');
    console.log('   Worker: worker@example.com / password123');
    console.log('   Admin: admin@jobpop.com / admin123');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
