/**
 * PARXSTREAM - cPanel & Node.js Production Entry Point
 * 
 * This file is automatically recognized by cPanel's "Setup Node.js App" 
 * (CloudLinux / Phusion Passenger) and standalone Node.js servers.
 */

const path = require('path');
const app = require('./server/server.js');

const PORT = process.env.PORT || 5001;

// If executed directly, start listening
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`🎬 PARXSTREAM Production Server is running!`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`=================================================\n`);
  });
}

module.exports = app;
