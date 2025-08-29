import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Script to generate all favicons and icons from the main CWT_Circle_LogoSPIN.png logo
// This script uses the generate-favicons.sh script which uses ImageMagick for proper resizing

const scriptPath = path.join(__dirname, 'generate-favicons.sh');

try {
  console.log('Generating favicons and icons from updated CWT_Circle_LogoSPIN.png...');
  execSync(`bash "${scriptPath}"`, { stdio: 'inherit' });
  console.log('✅ All favicons and icons have been updated successfully!');
} catch (error) {
  console.error('Error generating favicon files:', error);
  process.exit(1);
}
