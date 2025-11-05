const mongoose = require('mongoose');
const config = require('./config');

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB connection...');
  console.log('📡 Connection string:', config.mongoUri);
  
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected successfully!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', TestSchema);
    
    const testDoc = new TestModel({
      name: 'Connection Test',
      timestamp: new Date()
    });
    
    await testDoc.save();
    console.log('✅ Test document created successfully!');
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check if MongoDB is running');
      console.log('2. Verify the connection string');
      console.log('3. Check network access settings in MongoDB Atlas');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Authentication failed. Check:');
      console.log('1. Username and password in connection string');
      console.log('2. Database user permissions in MongoDB Atlas');
    }
    
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testMongoDBConnection()
    .then(success => {
      if (success) {
        console.log('\n🎉 MongoDB connection test passed!');
        process.exit(0);
      } else {
        console.log('\n❌ MongoDB connection test failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { testMongoDBConnection }; 