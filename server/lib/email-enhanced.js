// Enhanced sendAdminNewBooking function with fallback mechanism
import { Resend } from 'resend';

// Function to send admin booking notifications with fallback mechanism
export async function sendAdminNewBookingWithFallback(
  to,
  data
) {
  console.log(`[ADMIN-EMAIL-ENHANCED] Sending booking notification to: ${to}`);
  
  try {
    // Try the standard email sending first
    const { sendAdminNewBooking } = await import('./email.ts');
    console.log('[ADMIN-EMAIL-ENHANCED] Using standard email function...');
    
    const result = await sendAdminNewBooking(to, data);
    console.log('[ADMIN-EMAIL-ENHANCED] Standard email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('[ADMIN-EMAIL-ENHANCED] Standard email sending failed:', error);
    console.log('[ADMIN-EMAIL-ENHANCED] Attempting fallback method...');
    
    // Fallback to direct Resend API
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Create a simple HTML template
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4a6f8a;">New Booking Alert!</h1>
          <p>A new booking has been made with $0 reservation fee:</p>
          <div style="background: #f7f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #3d5a80; margin-top: 0;">Booking Details</h2>
            <ul style="padding-left: 20px;">
              <li><strong>Booking ID:</strong> ${data.bookingId}</li>
              <li><strong>Parent:</strong> ${data.parentName}</li>
              <li><strong>Email:</strong> ${data.parentEmail}</li>
              <li><strong>Phone:</strong> ${data.parentPhone || 'Not provided'}</li>
              <li><strong>Athlete(s):</strong> ${data.athleteNames.join(', ')}</li>
              <li><strong>Date:</strong> ${data.sessionDate}</li>
              <li><strong>Time:</strong> ${data.sessionTime}</li>
              <li><strong>Lesson Type:</strong> ${data.lessonType}</li>
              <li><strong>Amount:</strong> $${data.totalAmount}</li>
              <li><strong>Special Requests:</strong> ${data.specialRequests || 'None'}</li>
            </ul>
          </div>
          <p>
            <a href="${data.adminPanelLink}" 
               style="background: #3d5a80; 
                      color: white; 
                      padding: 12px 20px; 
                      text-decoration: none; 
                      border-radius: 4px; 
                      display: inline-block;">
              View in Admin Panel
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">
            This is a fallback email notification sent using the direct Resend API.
          </p>
        </div>
      `;
      
      const result = await resend.emails.send({
        from: 'Coach Will Tumbles <noreply@coachwilltumbles.com>',
        to,
        subject: '🎉 New Booking Received ($0 Reservation)',
        html,
      });
      
      console.log('[ADMIN-EMAIL-ENHANCED] Fallback email sent successfully:', result);
      return result;
    } catch (fallbackError) {
      console.error('[ADMIN-EMAIL-ENHANCED] Fallback email also failed:', fallbackError);
      throw fallbackError;
    }
  }
}
