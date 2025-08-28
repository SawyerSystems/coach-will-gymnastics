# Production Admin Email Configuration Fix

## Executive Summary

We've identified two issues with admin notification emails for $0 bookings:

1. **Incorrect Recipient**: Admin emails are being sent to `admin@coachwilltumbles.com` rather than to a monitored inbox. This happens because the production environment is likely missing the `ADMIN_EMAIL` environment variable or it's set to an unmonitored address.

2. **Format Error**: The admin emails are failing to send because of a format error in the `lessonType` field. The email component expects a string, but it's receiving an object with multiple properties.

## Issue Details

1. **Parent Emails Working Correctly**: Parent notification emails for $0 bookings are sent successfully.
2. **Admin Emails Failing**: Admin notification emails fail due to a format error in the `lessonType` field.
3. **Default Fallback Mechanism**: When `ADMIN_EMAIL` isn't set, the system falls back to `admin@coachwilltumbles.com`.
4. **Unmonitored Inbox**: Even if the format error is fixed, the default fallback email might not be monitored in production.
5. **Specific to $0 Bookings**: This only affects $0 reservation bookings that bypass the Stripe payment flow.

## Fix Instructions

### 1. Fix the Lesson Type Format Error

Update the code in `server/routes.ts` (around line 4892) to extract the lesson type name properly:

```javascript
// Current code (problematic)
const lessonType = bookingWithRelations.lessonType || 'Unknown Lesson Type';

// Fixed code
const lessonType = typeof bookingWithRelations.lessonType === 'object' && bookingWithRelations.lessonType !== null
  ? bookingWithRelations.lessonType.name  // Extract name from object
  : (bookingWithRelations.lessonType || 'Unknown Lesson Type');  // Keep string or use fallback
```

### 2. Update Production Environment Variable

1. Access the Render dashboard for the Coach Will Gymnastics application
2. Navigate to the Environment section
3. Add or update the `ADMIN_EMAIL` environment variable with a monitored admin email address
4. Save the changes and redeploy the application

```
ADMIN_EMAIL=notifications@coachwilltumbles.com  # Use your actively monitored admin email
```

### 2. Verify the Fix

After deploying with the updated environment variable:

1. Run our verification script in production:
   ```bash
   node verify-admin-email-config.mjs
   ```

2. Check the output to confirm the correct admin email is being used:
   ```
   [CHECKOUT-ADMIN-DEBUG] 🔍 ADMIN_EMAIL environment variable: "notifications@coachwilltumbles.com"
   [CHECKOUT-ADMIN-DEBUG] Final admin email address: notifications@coachwilltumbles.com
   ```

3. Create a test $0 reservation booking in production and verify both emails are received.

### 3. Testing Script

We've created two scripts to help with testing and verification:

1. `verify-admin-email-config.mjs` - Shows the current admin email configuration
2. `test-zero-booking-emails.mjs` - Sends test emails to both parent and admin

To use these scripts:
```bash
# Check the current admin email configuration
node verify-admin-email-config.mjs

# Send test emails
node test-zero-booking-emails.mjs
```

## Technical Root Causes

### Issue 1: Lesson Type Format Error

In the $0 booking path (server/routes.ts around line 4892), the `lessonType` field is being passed as an object to the email template, but the React component expects a string:

```javascript
// Current code (error)
const lessonType = bookingWithRelations.lessonType || 'Unknown Lesson Type';

// The lessonType value becomes an object like:
{
  "id": 1,
  "name": "Quick Journey",
  "duration": 30,
  "price": 40,
  "description": "...",
  "key": "quick-journey"
}

// This causes the React rendering error:
"Objects are not valid as a React child (found: object with keys {id, name, duration, price, description, key})"
```

### Issue 2: Admin Email Configuration

The fallback mechanism for admin email address works correctly, but if the environment variable isn't set in production, all admin notifications go to the default unmonitored inbox:

```javascript
// Get admin email from environment variable
const adminEmail = process.env.ADMIN_EMAIL || '';
console.log(`[CHECKOUT-ADMIN-DEBUG] 🔍 ADMIN_EMAIL environment variable: "${adminEmail}"`);

if (!adminEmail) {
  console.error(`[CHECKOUT-ADMIN-DEBUG] ❌ ADMIN_EMAIL is empty or not set. Using default: "admin@coachwilltumbles.com"`);
}

// Always use a value for admin email, falling back to the default if needed
const finalAdminEmail = adminEmail || 'admin@coachwilltumbles.com';
```

## Conclusion

We've identified two distinct issues affecting admin email notifications for $0 bookings:

1. **Code Bug**: The format of the `lessonType` field is incorrect (object instead of string), causing the React email template to fail rendering.

2. **Configuration Issue**: The admin email destination may be unmonitored if the `ADMIN_EMAIL` environment variable isn't set correctly in production.

Fixing both issues will ensure that admin notifications are properly sent and delivered to the correct inbox for all future $0 bookings.

For existing bookings, you may want to review recent $0 bookings in the database and send manual notifications if necessary.

## Summary of Actions

1. Update the code to correctly handle `lessonType` as an object when present
2. Configure the `ADMIN_EMAIL` environment variable in production
3. Test a new $0 booking to confirm both emails are delivered correctly
