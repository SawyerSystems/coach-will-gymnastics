// Browser console test script
// Open browser dev tools (F12) and paste this in console

console.log('🧪 Testing frontend API call...');

// Direct fetch call to check what browser receives
fetch('/api/bookings', {
  credentials: 'include'
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Frontend received bookings count:', data.length);
  console.log('First booking:', data[0]);
  
  if (data.length > 0) {
    console.log('✅ Frontend can access bookings API successfully');
  } else {
    console.log('❌ Frontend received empty bookings array');
  }
})
.catch(error => {
  console.error('❌ Frontend API error:', error);
});

// Also check React Query cache
if (window.__REACT_QUERY_CLIENT__) {
  const cache = window.__REACT_QUERY_CLIENT__.getQueryCache();
  const bookingsQuery = cache.find(['api/bookings']);
  console.log('React Query cache for bookings:', bookingsQuery);
} else {
  console.log('React Query client not found on window');
}
