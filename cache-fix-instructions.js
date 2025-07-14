#!/usr/bin/env node

// Cache buster utility to force browser cache refresh
const CACHE_BUSTERS = [
  '?v=' + Date.now(),
  '?cb=' + Math.random().toString(36).substr(2, 9),
  '?_t=' + new Date().getTime()
];

const instructions = `
🚨 BROWSER CACHE CLEARING INSTRUCTIONS

Your desktop is showing a cached version of the site. Here's how to fix it:

🔧 FORCE REFRESH METHODS:

1. Hard Refresh (Try these in order):
   • Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   • Firefox: Ctrl+F5 (Windows) or Cmd+F5 (Mac)
   • Safari: Cmd+Option+R

2. Clear Site Data:
   • Chrome: F12 → Application → Storage → Clear site data
   • Firefox: F12 → Storage → Clear All
   • Edge: F12 → Application → Storage → Clear site data

3. Incognito/Private Window:
   • Open your site in incognito/private browsing mode
   • This bypasses all cached content

4. Developer Tools Method:
   • F12 → Network tab → Check "Disable cache" → Refresh

🎯 RENDER PRODUCTION CACHE:
   • Your Render deployment may also have cached the old build
   • The new deployment should auto-clear this
   • Wait 2-3 minutes after deployment completes

📱 MOBILE VS DESKTOP:
   • Mobile works because it hasn't cached the broken version
   • Desktop has the old cached files stored locally

🎬 VIDEO BANNER ISSUE:
   • The video URL in .env might be expired (signed URLs expire)
   • The .MOV format may not play in all browsers
   • Phone shows fallback image correctly
   • Desktop may be trying to load cached video that fails

⚡ IMMEDIATE SOLUTION:
   1. Open site in incognito mode
   2. If it works → clear your regular browser cache
   3. If video doesn't show → update .env with new video URL
`;

console.log(instructions);

// Generate cache-busting URLs for testing
console.log('\n🔗 CACHE-BUSTING TEST URLS:');
console.log('Try these URLs to bypass cache:');

const baseUrl = 'https://your-render-app.onrender.com'; // Replace with actual URL
CACHE_BUSTERS.forEach((buster, index) => {
  console.log(`${index + 1}. ${baseUrl}${buster}`);
});

console.log('\n📋 NEXT STEPS:');
console.log('1. Try the cache clearing methods above');
console.log('2. Test in incognito mode');  
console.log('3. Check if video URL in .env is still valid');
console.log('4. If needed, update video to MP4 format for better browser support');
