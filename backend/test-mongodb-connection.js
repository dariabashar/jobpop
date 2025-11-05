const mongoose = require('mongoose');
const config = require('./config');

async function testMongoDBConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('📡 Connection string:', config.mongoUri.replace(/\/\/.*@/, '//<credentials>@'));
    
    const conn = await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected successfully!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔗 Connection state: ${conn.connection.readyState}`);
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test collection creation
    const testCollection = conn.connection.collection('test_connection');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Insert operation successful');
    
    // Test query
    const result = await testCollection.findOne({ test: true });
    console.log('✅ Query operation successful');
    
    // Clean up
    await testCollection.deleteOne({ test: true });
    console.log('✅ Delete operation successful');
    
    console.log('\n🎉 All MongoDB operations working correctly!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   - Username and password in .env file');
      console.log('   - Network access settings in MongoDB Atlas');
      console.log('   - Database user permissions');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection refused. Please check:');
      console.log('   - Internet connection');
      console.log('   - MongoDB Atlas cluster status');
      console.log('   - Connection string format');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Host not found. Please check:');
      console.log('   - Connection string format');
      console.log('   - Cluster name in MongoDB Atlas');
    }
    
    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Verify your MongoDB Atlas credentials');
    console.log('2. Check network access settings in MongoDB Atlas');
    console.log('3. Ensure the cluster is running');
    console.log('4. Verify the connection string format');
    
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testMongoDBConnection();
