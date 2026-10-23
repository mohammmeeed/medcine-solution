const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const staticDir = path.join(distDir, 'static');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(distDir)) {
  console.log('No dist directory found.');
  process.exit(0);
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Mirror static folder into assets
if (fs.existsSync(staticDir)) {
  copyRecursiveSync(staticDir, assetsDir);
  console.log('✓ Successfully populated dist/assets from dist/static');
}

// 2. Update dist/index.html to point to /assets/
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(/\/static\//g, '/assets/');
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('✓ Updated dist/index.html to reference /assets/');
}

// 3. Update bundle references in dist/assets
function updateBundleReferences(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      updateBundleReferences(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('static/')) {
        content = content.replace(/static\//g, 'assets/');
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}
updateBundleReferences(assetsDir);

console.log('✓ Build organization complete: dist/assets created and linked.');
