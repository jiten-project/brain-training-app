/**
 * OSSライセンス情報生成スクリプト
 * 使用方法: node scripts/generate-licenses.js
 */

const fs = require('fs');
const path = require('path');

const licensesPath = path.join(__dirname, '..', 'licenses.json');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'licenses.json');

if (!fs.existsSync(licensesPath)) {
  console.error('licenses.json が見つかりません。先に npx license-checker-rseidelsohn --production --json --out licenses.json を実行してください。');
  process.exit(1);
}

const licenses = require(licensesPath);

const packages = Object.entries(licenses).map(([fullName, info]) => {
  const match = fullName.match(/^(@?[^@]+)@(.+)$/);
  const name = match ? match[1] : fullName;
  const version = match ? match[2] : '';

  return {
    name: name,
    version: version,
    license: info.licenses || 'Unknown',
    repository: info.repository || ''
  };
});

packages.sort((a, b) => a.name.localeCompare(b.name));

const summary = {};
packages.forEach(p => {
  summary[p.license] = (summary[p.license] || 0) + 1;
});

const result = {
  generatedAt: new Date().toISOString().split('T')[0],
  totalPackages: packages.length,
  summary: Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([license, count]) => ({ license, count })),
  packages: packages
};

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`ライセンス情報を生成しました: ${outputPath}`);
console.log(`パッケージ数: ${packages.length}`);
