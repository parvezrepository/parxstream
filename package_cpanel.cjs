const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');

// Clean up old local tempDir if exists
const localTemp = path.join(__dirname, 'temp_cpanel_pack');
if (fs.existsSync(localTemp)) {
  try { fs.rmSync(localTemp, { recursive: true, force: true }); } catch (e) {}
}

// Use OS temp directory to avoid OneDrive file locking
const tempDir = path.join(os.tmpdir(), 'parxstream_cpanel_pack_' + Date.now());
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.mkdirSync(tempDir, { recursive: true });

// 1. Copy root files
const rootFiles = ['app.js', 'app.cjs', 'package.json', '.htaccess', '.npmrc', 'index.html', 'manifest.json', 'sw.js', 'icon-192.svg', 'icon-512.svg'];
rootFiles.forEach(f => {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, path.join(tempDir, f));
  }
});

// 2. Copy dist folder if exists
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

// 4. Compress with PowerShell Compress-Archive
const zipPath = path.join(__dirname, 'cpanel_full_app.zip');
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

cp.execSync(`powershell -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${zipPath}' -Force"`);

// 5. Cleanup temp
fs.rmSync(tempDir, { recursive: true, force: true });

const stats = fs.statSync(zipPath);
console.log(`SUCCESS: Created cpanel_full_app.zip (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

