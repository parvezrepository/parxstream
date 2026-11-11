/**
 * PARXSTREAM - cPanel & Node.js Production Entry Point
 * 
 * 100% compatible with:
 * - cPanel CloudLinux "Setup Node.js App" / Phusion Passenger
 * - LiteSpeed / Apache reverse proxy
 * - Direct execution: `node app.js` or `npm start`
 */

const app = require('./server/server.js');

const PORT = process.env.PORT || 5001;

// Phusion Passenger / cPanel compatibility:
// Passenger passes the listening port or unix socket in process.env.PORT.
// Calling listen() unconditionally ensures Passenger binds immediately without hanging!
const server = app.listen(PORT, '0.0.0.0', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr ? addr.port : PORT}`;
  console.log(`\n=================================================`);
  console.log(`🎬 PARXSTREAM Production Server is running on cPanel!`);
  console.log(`   Bound to: ${bind}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`=================================================\n`);
});

module.exports = app;
