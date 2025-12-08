const dns = require('dns');

console.log('Testing DNS resolution...\n');

// Test if DNS is working
dns.resolve('google.com', (err) => {
  if (err) {
    console.log('❌ General DNS not working');
    console.log('Try: ipconfig /flushdns (Windows) or sudo dscacheutil -flushcache (Mac)');
  } else {
    console.log('✅ General DNS is working');
  }
});

// Test MongoDB Atlas domain
dns.resolveSrv('_mongodb._tcp.referral-system.7u6imkb.mongodb.net', (err, addresses) => {
  if (err) {
    console.log(`\n❌ MongoDB SRV record not found: ${err.code}`);
    console.log('\nSOLUTIONS:');
    console.log('1. Use direct IP connection (see script above)');
    console.log('2. Change DNS to Google DNS (8.8.8.8)');
    console.log('3. Try different network (mobile hotspot)');
  } else {
    console.log('\n✅ MongoDB SRV records found:', addresses);
  }
});