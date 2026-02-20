import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const packageJsonPath = resolve(process.cwd(), 'package.json');
const chromeManifestPath = resolve(process.cwd(), 'manifest.chrome.json');
const firefoxManifestPath = resolve(process.cwd(), 'manifest.firefox.json');

try {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const version = packageJson.version;

  console.log(`Updating version to ${version}...`);

  const chromeManifest = JSON.parse(readFileSync(chromeManifestPath, 'utf-8'));
  chromeManifest.version = version;
  writeFileSync(chromeManifestPath, JSON.stringify(chromeManifest, null, 2) + '\n');
  console.log('✓ Updated manifest.chrome.json');

  const firefoxManifest = JSON.parse(readFileSync(firefoxManifestPath, 'utf-8'));
  firefoxManifest.version = version;
  writeFileSync(firefoxManifestPath, JSON.stringify(firefoxManifest, null, 2) + '\n');
  console.log('✓ Updated manifest.firefox.json');

  console.log('Version update complete!');
} catch (error) {
  console.error('Error updating version:', error);
  process.exit(1);
}
