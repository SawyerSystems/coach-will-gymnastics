import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateBusinessLogicIssues() {
  console.log('🔍 Investigating Business Logic Issues...\n');

  try {
    // Issue #1: Check recent booking that went through on blocked day
    console.log('📊 Issue #1: Recent booking on blocked day');
    console.log('=====================================');
    
    const { data: recentBooking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', 245)
      .single();
    
    if (bookingError) {
      console.error('Error fetching booking 245:', bookingError);
    } else {
      console.log('📅 Booking #245 Details:');
      console.log(`   Created: ${recentBooking.created_at}`);
      console.log(`   Preferred Date: ${recentBooking.preferred_date}`);
      console.log(`   Preferred Time: ${recentBooking.preferred_time}`);
      console.log(`   Parent Email: ${recentBooking.parent_email}`);
      console.log(`   Athlete: ${recentBooking.athlete1_name}`);
      
      // Check if there were any events blocking this date/time
      const bookingDate = recentBooking.preferred_date;
      const bookingTime = recentBooking.preferred_time;
      
      console.log(`\n🚫 Checking for blocks on ${bookingDate} at ${bookingTime}:`);
      
      // Get events that might have blocked this time
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('is_availability_block', true)
        .gte('start_at', `${bookingDate}T00:00:00`)
        .lte('start_at', `${bookingDate}T23:59:59`);
      
      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      } else {
        console.log(`   Found ${events.length} blocking events on ${bookingDate}`);
        events.forEach(event => {
          console.log(`   - "${event.title}" (${event.start_at} to ${event.end_at})`);
          console.log(`     Reason: ${event.blocking_reason || 'No reason'}`);
        });
      }
    }
    
    console.log('\n');
    
    // Issue #2: Check email date problem
    console.log('📊 Issue #2: Email date problem');
    console.log('==============================');
    
    if (recentBooking && recentBooking.session_confirmation_email_sent_at) {
      const emailSentDate = new Date(recentBooking.session_confirmation_email_sent_at);
      const preferredDate = new Date(recentBooking.preferred_date + 'T00:00:00Z'); // Ensure UTC parsing
      
      console.log(`   Email sent at: ${emailSentDate.toISOString()}`);
      console.log(`   Email sent date: ${emailSentDate.toLocaleDateString()}`);
      console.log(`   Preferred booking date: ${recentBooking.preferred_date}`);
      console.log(`   Preferred booking date parsed: ${preferredDate.toLocaleDateString()}`);
      
      const daysDifference = Math.floor((preferredDate - emailSentDate) / (1000 * 60 * 60 * 24));
      console.log(`   Days difference: ${daysDifference} days`);
      
      if (daysDifference < 0) {
        console.log(`   ❌ PROBLEM: Email shows date ${Math.abs(daysDifference)} days BEFORE actual booking date!`);
      } else if (daysDifference > 0) {
        console.log(`   ✅ Email shows date ${daysDifference} days BEFORE booking date (this is normal)`);
      } else {
        console.log(`   ✅ Email date matches booking date`);
      }
    }
    
    // Check current availability system
    console.log('\n📊 Checking current availability blocking system:');
    console.log('================================================');
    
    const { data: allEvents, error: allEventsError } = await supabase
      .from('events')
      .select('*')
      .eq('is_availability_block', true)
      .order('start_at', { ascending: true })
      .limit(5);
    
    if (allEventsError) {
      console.error('Error fetching all events:', allEventsError);
    } else {
      console.log(`   Total blocking events in system: ${allEvents.length || 0}`);
      if (allEvents && allEvents.length > 0) {
        console.log('   Recent blocking events:');
        allEvents.forEach((event, i) => {
          console.log(`   ${i + 1}. "${event.title}" - ${event.start_at} to ${event.end_at}`);
          console.log(`      Reason: ${event.blocking_reason || 'No reason'}`);
          console.log(`      All day: ${event.is_all_day ? 'Yes' : 'No'}`);
        });
      }
    }
    
    // Check if migration to events system is complete
    console.log('\n📊 Checking legacy availability_exceptions:');
    console.log('==========================================');
    
    const { data: exceptions, error: exceptionsError } = await supabase
      .from('availability_exceptions')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (exceptionsError) {
      console.error('Error fetching exceptions:', exceptionsError);
    } else {
      console.log(`   Legacy exceptions count: ${exceptions.length || 0}`);
      if (exceptions && exceptions.length > 0) {
        console.log('   Recent exceptions:');
        exceptions.forEach((exc, i) => {
          console.log(`   ${i + 1}. ${exc.date} ${exc.start_time || 'all day'} - ${exc.reason}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

investigateBusinessLogicIssues();
