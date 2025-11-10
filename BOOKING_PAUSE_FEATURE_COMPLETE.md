# Booking Pause Feature - Implementation Complete

## Summary
Implemented a site-wide booking pause system that allows administrators to temporarily disable online bookings with a custom message to parents. **Now includes scheduled pause periods with automatic start and end times.**

## What Was Implemented

### 1. Database Schema
**File:** `add-site-settings-table.sql`
- Created `site_settings` table with key-value configuration storage
- Added settings for:
  - `bookings_paused` - Boolean flag to enable/disable bookings
  - `bookings_paused_message` - Custom message displayed to parents
  - `bookings_pause_start` - **NEW:** ISO datetime when pause should automatically start
  - `bookings_pause_end` - **NEW:** ISO datetime when pause should automatically end and bookings resume
- Includes audit trail with `updated_by` and timestamps
- **Action Required:** Run this SQL file in Supabase SQL editor

### 2. Schema Definition
**File:** `shared/schema.ts`
- Added `siteSettings` table definition using Drizzle ORM
- Exported `SiteSetting` and `InsertSiteSetting` types
- Includes foreign key reference to admins table for tracking who updated settings

### 3. Backend API Endpoints
**File:** `server/routes.ts`

Added three endpoints:

#### GET /api/site-settings
- **Public endpoint** - accessible without authentication
- Returns all site settings or single setting with `?key=X` query parameter
- Used by frontend to check if bookings are paused

#### PATCH /api/admin/site-settings/:key
- **Admin-only endpoint** - requires admin authentication
- Updates a specific setting's value
- Automatically tracks who made the change and when
- Used by admin panel to toggle pause state and update message

#### POST /api/bookings (modified)
- Added comprehensive check for `bookings_paused` setting at the start
- **NEW:** Checks scheduled pause start/end times to determine if currently paused
- **Auto-resume logic:** If current time is past `pause_end`, automatically updates database to unpause
- **Scheduled start:** If current time is before `pause_start`, bookings are allowed even if toggle is on
- Returns HTTP 503 (Service Unavailable) with custom message if paused
- Prevents booking creation when system is paused

### 4. Admin UI Controls
**File:** `client/src/components/admin/AdminSettingsTab.tsx`

Added `BookingControlsCollapsible` component in the "General" settings tab:
- **Toggle Switch:** Enable/disable online bookings
- **Message Editor:** Textarea for custom message to parents
- **Start Date/Time Picker:** **NEW:** Optional scheduled start time for pause
- **End Date/Time Picker:** **NEW:** Optional scheduled end time for auto-resume
- **Save Button:** Persists all four settings via PATCH endpoints
- **Auto-fetch:** Loads current settings on mount
- **Toast notifications:** Success/error feedback

Features:
- Collapsible section to save space
- Real-time state management with React Query
- Validation and error handling
- Integrated into existing admin settings flow
- **Flexible scheduling:** Leave dates empty for immediate/indefinite pause, or set specific times

### 5. Parent-Facing Booking Page
**File:** `client/src/pages/booking.tsx`

Modified to check pause status:
- **Fetch pause settings** on page load (including start/end times)
- **Smart pause detection:** Evaluates current time against start/end schedule
- **Replace booking buttons** with pause message when currently paused
- **Three display locations:**
  1. Hero "Begin Journey" button
  2. Lesson type card buttons
  3. Bottom CTA "Start Your Athlete's Journey" button

Pause message display:
- Yellow alert box with icon in hero/lesson cards
- White/translucent box in blue CTA section
- Shows custom admin message with proper formatting
- **NEW:** Displays resume date/time if end time is set (e.g., "Bookings will resume on 12/25/2025 at 8:00 AM")
- Clear visual indication bookings are unavailable

## How to Use

### For Admins

1. **Navigate to Admin Settings:**
   - Go to Admin Panel → Settings tab → General section
   - Click "Booking Controls" to expand

2. **Pause Bookings (Immediate):**
   - Toggle "Pause Online Bookings" switch to ON
   - Edit the message parents will see (optional)
   - Leave start/end dates empty
   - Click "Save Booking Settings"
   - **Bookings are paused immediately**

3. **Pause Bookings (Scheduled):**
   - Toggle "Pause Online Bookings" switch to ON
   - Set "Start Date/Time" to when pause should begin
   - Set "End Date/Time" to when bookings should auto-resume (optional)
   - Edit the message parents will see
   - Click "Save Booking Settings"
   - **Bookings will pause automatically at the scheduled time**

4. **Resume Bookings:**
   - Toggle "Pause Online Bookings" switch to OFF
   - Click "Save Booking Settings"
   - **OR** wait for automatic resume if end date/time was set

### For Parents

When bookings are paused:
- Booking page displays yellow alert message instead of buttons
- Custom admin message explains why bookings are unavailable
- **NEW:** If end time is set, message shows when bookings will resume
- No ability to start booking flow
- Backend also blocks any direct API calls to create bookings

**Scheduled pauses:**
- If pause is scheduled for future, parents see normal booking buttons until start time
- Once start time is reached, pause automatically activates
- When end time is reached, bookings automatically resume
- Parents always see accurate status based on current time vs. schedule

## Technical Details

### State Management
- React Query for data fetching and caching
- Optimistic UI updates with automatic refetch
- Query key: `['/api/site-settings']` for cache management

### Error Handling
- Toast notifications for admin actions
- HTTP 503 status for paused booking attempts
- Graceful fallbacks for missing settings

### Security
- Admin-only write access to settings
- Public read access (necessary for booking page check)
- Audit trail tracks who paused/resumed bookings

## Use Cases

1. **Scheduled Vacation/Time Off**
   - Set start date: Dec 20, 2025 at 5:00 PM
   - Set end date: Dec 30, 2025 at 8:00 AM
   - Message: "Coach Will is on vacation Dec 20-30. Bookings will automatically resume after the holidays!"
   - **System automatically pauses and resumes at scheduled times**

2. **Capacity Limits**
   - Pause immediately (no dates)
   - Message: "We're currently at capacity for this month. Please check back in 2 weeks for February openings."
   - **Manually resume when capacity opens up**

3. **Emergency Situations**
   - Quickly toggle pause on (no dates)
   - Message: "Due to unforeseen circumstances, online bookings are temporarily unavailable. Please email us at..."
   - **Immediate effect, manual resume when ready**

4. **Weekend/Holiday Closure**
   - Set start: Friday 6:00 PM
   - Set end: Monday 8:00 AM
   - Message: "Office closed for the weekend. Bookings will resume Monday morning."
   - **Automatic weekend pause, no manual intervention needed**

5. **System Maintenance Window**
   - Set start: Tomorrow 2:00 AM
   - Set end: Tomorrow 6:00 AM
   - Message: "We're upgrading our booking system! Online bookings will automatically resume at 6 AM."
   - **Scheduled maintenance with precise timing**

## Files Modified

1. `shared/schema.ts` - Added site_settings table definition
2. `add-site-settings-table.sql` - Database migration (needs manual run)
3. `server/routes.ts` - Added GET/PATCH endpoints, modified POST /api/bookings
4. `client/src/components/admin/AdminSettingsTab.tsx` - Added booking controls UI
5. `client/src/pages/booking.tsx` - Added pause check and message display

## Testing Checklist

- [ ] Run `add-site-settings-table.sql` in Supabase SQL editor
- [ ] Verify default settings exist in database (including new start/end fields)
- [ ] **Test immediate pause:**
  - [ ] Toggle pause ON with no dates
  - [ ] Verify booking page shows pause message immediately
  - [ ] Toggle pause OFF
  - [ ] Verify booking page shows booking buttons
- [ ] **Test scheduled pause (future start):**
  - [ ] Toggle pause ON with start time 5 minutes in future
  - [ ] Verify booking page still shows buttons (pause not active yet)
  - [ ] Wait until start time passes
  - [ ] Verify booking page now shows pause message
- [ ] **Test auto-resume:**
  - [ ] Set pause with end time 2 minutes in future
  - [ ] Verify pause message shows with resume time
  - [ ] Wait until end time passes
  - [ ] Verify booking page automatically shows buttons again
  - [ ] Check database: bookings_paused should be auto-updated to 'false'
- [ ] Test custom message updates
- [ ] Verify parent sees updated message with resume time
- [ ] Test direct API call to POST /api/bookings when paused (should return 503)
- [ ] Check audit trail: updated_by and updated_at columns

## Future Enhancements (Optional)

1. **Recurring Pause Schedules**
   - Weekly pause patterns (e.g., every weekend)
   - Holiday templates
   - Automatically apply known closure dates

2. **Admin Notifications**
   - Email notification to admin before scheduled pause starts
   - Reminder before auto-resume
   - Daily digest of pause status

3. **Multiple Messages**
   - Different messages for different pause reasons
   - Template library for common scenarios
   - Message preview before saving

4. **Partial Pause**
   - Pause only specific lesson types
   - Pause only for specific date ranges on calendar
   - Blackout specific time slots

5. **Advanced Scheduling**
   - Multiple pause periods in queue
   - Visual calendar showing pause schedule
   - Conflict detection for overlapping pauses

## Notes

- Bookings created by admins via Admin Panel are NOT affected by pause
- Existing bookings are not affected by pause state
- Parents logged in through parent portal can still view their existing bookings
- System remembers pause state across server restarts (stored in database)
