/**
 * PARXSTREAM - cPanel CommonJS Production Entry Point (app.cjs)
 * 
 * Specifically designed for cPanel "Setup Node.js App" / Phusion Passenger
 * which invokes applications in CommonJS mode.
 */

const path = require('path');
const app = require('./server/server.js');

const PORT = process.env.PORT || 5001;

if (require.main === module || process.env.CPANEL_AUTO_START === 'true') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=================================================`);
    console.log(`🎬 PARXSTREAM Production Server is running (CommonJS)!`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`=================================================\n`);
  });
}

module.exports = app;

