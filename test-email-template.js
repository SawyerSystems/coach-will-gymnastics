// Check if admin email templates exist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminTemplates = [
  'AdminNewParent.tsx',
  'AdminNewAthlete.tsx',
  'AdminNewBooking.tsx',
  'AdminBookingCancellation.tsx',
  'AdminBookingReschedule.tsx',
  'AdminWaiverSigned.tsx'
];

const emailsDir = path.join(__dirname, 'emails');
console.log(`Looking for templates in: ${emailsDir}`);

console.log('Checking admin email templates:');
adminTemplates.forEach(template => {
  const templatePath = path.join(emailsDir, template);
  if (fs.existsSync(templatePath)) {
    console.log(`✅ ${template} exists`);
    // Read first few lines to check imports
    const content = fs.readFileSync(templatePath, 'utf8').split('\n').slice(0, 20).join('\n');
    console.log(`Preview:\n${content.slice(0, 200)}...\n`);
  } else {
    console.log(`❌ ${template} is missing`);
  }
});
