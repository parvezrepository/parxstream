const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');

console.log('📦 Starting PARXSTREAM Production Packaging for cPanel...');

// Clean up old local tempDir if exists
const localTemp = path.join(__dirname, 'temp_cpanel_pack');
if (fs.existsSync(localTemp)) {
  try { fs.rmSync(localTemp, { recursive: true, force: true }); } catch (e) {}
}

// Use OS temp directory to avoid OneDrive file locking
const tempDir = path.join(os.tmpdir(), 'parxstream_cpanel_pack_' + Date.now());
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.mkdirSync(tempDir, { recursive: true });

// 1. Copy root entry files
const rootFiles = ['app.js', 'app.cjs', '.htaccess', '.npmrc', 'index.html', 'manifest.json', 'sw.js', 'icon-192.svg', 'icon-512.svg'];
rootFiles.forEach(f => {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join(tempDir, f));
  }
});

// Write lean, 100% conflict-free production package.json (no devDependencies to avoid ERESOLVE)
const productionPkg = {
  name: "parxstream",
  version: "1.0.0",
  private: true,
  main: "app.js",
  scripts: {
    start: "node app.js"
  },
  dependencies: {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "axios": "^1.7.9",
    "cheerio": "^1.0.0",
    "dotenv": "^16.4.7",
    "crypto-js": "^4.2.0"
  }
};
fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(productionPkg, null, 2));

// 2. Copy dist folder
if (fs.existsSync('dist')) {
  cp.execSync(`xcopy /E /I /Q /Y dist "${path.join(tempDir, 'dist')}"`);
}

// 3. Copy server folder excluding node_modules
function copyDirFiltered(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirFiltered(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDirFiltered('server', path.join(tempDir, 'server'));

// 4. Pre-install production node_modules so cPanel does not fail on missing modules
console.log('⚡ Pre-installing clean production node_modules into package...');
try {
  cp.execSync('npm install --omit=dev --no-audit --no-fund --legacy-peer-deps', {
    cwd: tempDir,
    stdio: 'ignore'
  });
  console.log('✅ node_modules pre-installed successfully!');
} catch (npmErr) {
  console.warn('⚠️ Could not pre-install node_modules, continuing:', npmErr.message);
}

// 5. Compress with PowerShell Compress-Archive
console.log('🗜️ Compressing into cpanel_full_app.zip...');
const zipPath = path.join(__dirname, 'cpanel_full_app.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

cp.execSync(`powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`);

// 6. Cleanup temp
fs.rmSync(tempDir, { recursive: true, force: true });

const stats = fs.statSync(zipPath);
console.log(`\n🎉 SUCCESS: Created self-contained cpanel_full_app.zip (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
