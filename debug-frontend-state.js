// Debug script to add to browser console
// Open admin dashboard in browser and paste this code

// Function to debug the booking data and filters
function debugBookingDisplay() {
  console.log('🔍 Debugging booking display issue...');
  
  // Check React Query cache
  const reactApp = document.querySelector('#root')?._reactInternalFiber?.child;
  
  // Manual check of localStorage or sessionStorage for stale data
  console.log('📦 LocalStorage keys:', Object.keys(localStorage));
  console.log('📦 SessionStorage keys:', Object.keys(sessionStorage));
  
  // Check for any React Query cache entries
  Object.keys(localStorage).forEach(key => {
    if (key.includes('query') || key.includes('booking')) {
      console.log(`🗄️ Storage entry ${key}:`, localStorage[key]);
    }
  });
  
  // Try to find the component state
  const filterSelects = document.querySelectorAll('[data-state="closed"]');
  console.log('🎛️ Filter elements found:', filterSelects.length);
  
  // Check if any error messages are visible
  const errorElements = document.querySelectorAll('[role="alert"], .text-red-500, .text-destructive');
  console.log('⚠️ Error elements found:', errorElements.length);
  errorElements.forEach((el, i) => {
    console.log(`Error ${i}:`, el.textContent);
  });
  
  // Check for loading states
  const loadingElements = document.querySelectorAll('[data-loading="true"], .loading, .spinner');
  console.log('⏳ Loading elements found:', loadingElements.length);
  
  // Check for empty state messages
  const emptyStateElements = document.querySelectorAll('.text-muted-foreground');
  console.log('📭 Empty state messages found:', emptyStateElements.length);
  emptyStateElements.forEach((el, i) => {
    console.log(`Empty state ${i}:`, el.textContent);
  });
  
  // Check the current tab
  const activeTab = document.querySelector('[data-state="active"]');
  console.log('📑 Active tab:', activeTab?.textContent);
  
  console.log('✅ Debug complete - check above for clues!');
}

debugBookingDisplay();
