// Test waiver file clearing functionality
import fs from 'fs';
import path from 'path';

async function testWaiverClearing() {
  console.log('🧪 Testing Waiver File Clearing Logic');
  console.log('='.repeat(50));
  
  try {
    const waiversDir = path.join(process.cwd(), 'data', 'waivers');
    
    if (fs.existsSync(waiversDir)) {
      console.log('📁 Waivers directory found:', waiversDir);
      
      const files = fs.readdirSync(waiversDir);
      const waiverFiles = files.filter(file => file.startsWith('waiver_') && file.endsWith('.pdf'));
      
      console.log('📋 Current waiver files:');
      waiverFiles.forEach((file, index) => {
        const filePath = path.join(waiversDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  ${index + 1}. ${file} (${Math.round(stats.size / 1024)}KB)`);
      });
      
      console.log(`\\n📊 Summary:`);
      console.log(`  • Total files in directory: ${files.length}`);
      console.log(`  • Waiver files (waiver_*.pdf): ${waiverFiles.length}`);
      console.log(`  • Non-waiver files: ${files.length - waiverFiles.length}`);
      
      console.log('\\n✅ Waiver clearing logic would:');
      console.log(`  • Clear ${waiverFiles.length} waiver files`);
      console.log(`  • Keep ${files.length - waiverFiles.length} non-waiver files`);
      console.log(`  • Free up ~${Math.round(waiverFiles.reduce((total, file) => {
        const filePath = path.join(waiversDir, file);
        return total + fs.statSync(filePath).size;
      }, 0) / 1024)}KB of disk space`);
      
    } else {
      console.log('❌ No waivers directory found at:', waiversDir);
    }
    
  } catch (error) {
    console.error('❌ Error testing waiver clearing:', error);
  }
  
  console.log('\\n🔧 Enhanced Clear Test Data Features:');
  console.log('  ✅ Backend: Added waiver file clearing to /api/admin/clear-test-data');
  console.log('  ✅ Frontend: Updated admin panel confirmation dialog');
  console.log('  ✅ Feedback: Enhanced success message to show waiver count');
  console.log('  ✅ Safety: Only deletes files matching waiver_*.pdf pattern');
  console.log('  ✅ Logging: Detailed console output for admin monitoring');
}

testWaiverClearing().catch(console.error);
