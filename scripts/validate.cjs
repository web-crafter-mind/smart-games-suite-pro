const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'index.html',
  'power-pack.js',
  'production-shell.js',
  'manifest.webmanifest',
  'manifest.json',
  'sw.js',
  'privacy-policy.html',
  'terms.html',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png'
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

for (const file of requiredFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error(`Missing required file: ${file}`);
  if (fs.statSync(full).size === 0) throw new Error(`File is empty: ${file}`);
}

const html = read('index.html');
if (!html.includes('manifest.webmanifest')) throw new Error('index.html does not link manifest.webmanifest');
if (!html.includes('power-pack.js')) throw new Error('index.html does not load power-pack.js');
if (!html.includes('production-shell.js')) throw new Error('index.html does not load production-shell.js');
if (!html.includes('serviceWorker')) throw new Error('index.html does not register the service worker');
if (!html.includes('mobileExitBtn')) throw new Error('Missing mobile exit button');
if (!html.includes('mobileMusicBtn') || !html.includes('mobileSfxBtn')) throw new Error('Missing mobile audio controls');

const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/);
if (!inlineScript) throw new Error('No inline game script found in index.html');
new Function(inlineScript[1]);

const powerPack = read('power-pack.js');
new Function(powerPack);

const productionShell = read('production-shell.js');
new Function(productionShell);

const manifest = JSON.parse(read('manifest.webmanifest'));
if (!manifest.icons?.some((icon) => icon.sizes === '512x512' && icon.purpose.includes('maskable'))) {
  throw new Error('manifest.webmanifest is missing a 512x512 maskable icon');
}

JSON.parse(read('manifest.json'));

const serviceWorker = read('sw.js');
for (const file of ['index.html', 'power-pack.js', 'production-shell.js', 'manifest.webmanifest', 'privacy-policy.html', 'terms.html', 'assets/icons/icon-512.png']) {
  if (!serviceWorker.includes(file)) throw new Error(`sw.js does not cache ${file}`);
}

console.log('Validation passed: Android-ready app shell, mobile controls, scripts, manifest, icons, legal pages, and offline cache are ready.');
