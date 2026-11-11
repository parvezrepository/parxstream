/**
 * PARXSTREAM - cPanel CommonJS Production Entry Point (app.cjs)
 * 
 * Specifically designed for cPanel "Setup Node.js App" / Phusion Passenger
 */

const app = require('./server/server.js');

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, '0.0.0.0', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr ? addr.port : PORT}`;
  console.log(`\n=================================================`);
  console.log(`🎬 PARXSTREAM Production Server is running (CommonJS)!`);
  console.log(`   Bound to: ${bind}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`=================================================\n`);
});

module.exports = app;
