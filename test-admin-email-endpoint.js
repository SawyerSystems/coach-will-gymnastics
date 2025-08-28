// Add this in server/routes.ts where your test API endpoints are defined

// Test endpoint for admin email functionality
app.post('/api/test/admin-email', async (req, res) => {
  console.log('📧 [TEST] Testing admin email functionality');
  
  try {
    const { sendAdminNewBookingWithFallback } = await import('./lib/email-enhanced.js');
    const adminEmail = process.env.ADMIN_EMAIL || 'coach@coachwilltumbles.com';
    
    const data = req.body;
    console.log('[TEST] Admin email test data:', data);
    
    // Handle lessonType conversion according to the fix
    if (typeof data.lessonType === 'object' && data.lessonType !== null) {
      console.log('[TEST] Converting lessonType from object to string...');
      console.log('[TEST] Before:', data.lessonType);
      data.lessonType = data.lessonType.name || 'Unknown Lesson Type';
      console.log('[TEST] After:', data.lessonType);
    }
    
    const result = await sendAdminNewBookingWithFallback(adminEmail, data);
    
    console.log('[TEST] Email result:', result);
    res.status(200).json({ success: true, message: 'Test email sent', result });
  } catch (error) {
    console.error('[TEST] Error sending test email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message || 'Unknown error' 
    });
  }
});
