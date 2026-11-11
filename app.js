/**
 * PARXSTREAM - cPanel & Node.js Production Entry Point
 * 
 * Compatible with cPanel "Setup Node.js App" (CloudLinux / Phusion Passenger),
 * PM2, and direct execution via `node app.js` or `npm start`.
 */

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const app = require('./server/server.js');

const PORT = process.env.PORT || 5001;

// If executed directly, start listening
const isMain = process.argv[1] && (
  process.argv[1].endsWith('app.js') ||
  process.argv[1].endsWith('app.cjs')
);

if (isMain || process.env.CPANEL_AUTO_START === 'true') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n=================================================`);
    console.log(`🎬 PARXSTREAM Production Server is running on cPanel!`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`=================================================\n`);
  });
}

export default app;
