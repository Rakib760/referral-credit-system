// simple-test.js
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔗 Testing MongoDB connection...');
  
  try {
    // Simple connection without any options
    await mongoose.connect('mongodb://127.0.0.1:27017/referral-system');
    console.log('✅ MongoDB connected!');
    
    // Check connection state
    console.log('📊 Connection state:', mongoose.connection.readyState);
    console.log('📁 Database name:', mongoose.connection.name);
    console.log('👤 Host:', mongoose.connection.host);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('💡 Make sure MongoDB is running:');
    console.log('   - Open Command Prompt as Administrator');
    console.log('   - Run: net start MongoDB');
    console.log('   - Or run: mongod');
  }
}

testConnection();