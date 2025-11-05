const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890'
};

let authToken = '';

// Helper function to make authenticated requests
const authRequest = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

authRequest.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Test functions
async function testHealthCheck() {
  try {
    console.log('🔍 Testing health check...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testRegistration() {
  try {
    console.log('🔍 Testing user registration...');
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', response.data.message);
    authToken = response.data.data.token;
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️  User already exists, trying login...');
      return await testLogin();
    }
    console.error('❌ Registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLogin() {
  try {
    console.log('🔍 Testing user login...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', response.data.message);
    authToken = response.data.data.token;
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetProfile() {
  try {
    console.log('🔍 Testing get profile...');
    const response = await authRequest.get('/users/profile');
    console.log('✅ Get profile successful:', response.data.data.user.firstName);
    return true;
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCreateJob() {
  try {
    console.log('🔍 Testing job creation...');
    const jobData = {
      title: 'Test Job',
      description: 'This is a test job for API testing',
      category: 'Delivery',
      pay: {
        amount: 25,
        currency: 'USD',
        type: 'fixed'
      },
      location: {
        address: '123 Test St',
        city: 'Test City',
        coordinates: [-74.006, 40.7128]
      },
      date: '2025-02-01',
      time: {
        start: '14:00',
        end: '18:00'
      },
      duration: 4
    };

    const response = await authRequest.post('/jobs', jobData);
    console.log('✅ Job creation successful:', response.data.data.job.title);
    return response.data.data.job._id;
  } catch (error) {
    console.error('❌ Job creation failed:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testGetJobs() {
  try {
    console.log('🔍 Testing get jobs...');
    const response = await authRequest.get('/jobs');
    console.log('✅ Get jobs successful:', response.data.data.jobs.length, 'jobs found');
    return true;
  } catch (error) {
    console.error('❌ Get jobs failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testWallet() {
  try {
    console.log('🔍 Testing wallet...');
    const response = await authRequest.get('/payments/wallet');
    console.log('✅ Get wallet successful:', response.data.data.wallet.balance);
    return true;
  } catch (error) {
    console.error('❌ Get wallet failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testNotifications() {
  try {
    console.log('🔍 Testing notifications...');
    const response = await authRequest.get('/notifications');
    console.log('✅ Get notifications successful:', response.data.data.notifications.length, 'notifications');
    return true;
  } catch (error) {
    console.error('❌ Get notifications failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API tests...\n');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Registration/Login', fn: testRegistration },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Get Jobs', fn: testGetJobs },
    { name: 'Create Job', fn: testCreateJob },
    { name: 'Get Wallet', fn: testWallet },
    { name: 'Get Notifications', fn: testNotifications }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    if (result) {
      passed++;
    }
    console.log('---\n');
  }

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the server logs.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testHealthCheck,
  testRegistration,
  testLogin,
  testGetProfile,
  testCreateJob,
  testGetJobs,
  testWallet,
  testNotifications
}; 