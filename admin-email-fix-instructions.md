# Admin Email Configuration Fix Instructions

## Issue Summary
The parent email notifications are successfully being sent for $0 reservation bookings, but the admin notifications may be going to an unmonitored mailbox (`admin@coachwilltumbles.com`). This happens because:

1. The code checks for `process.env.ADMIN_EMAIL` in the $0 booking path
2. If it's empty or unset, it falls back to `admin@coachwilltumbles.com`
3. In production, the `ADMIN_EMAIL` variable might be incorrectly set or missing

**Verification Results:**
- Local environment testing confirms the email system works correctly
- Current `ADMIN_EMAIL` in development is set to: `admin@coachwilltumbles.com`
- Both parent and admin emails were successfully sent in our test
- If the default email address isn't monitored in production, this explains why admin notifications appear missing

**Root Cause:**
In the $0 booking path (which bypasses Stripe), the code uses a fallback mechanism for the admin email:

```javascript
// From server/routes.ts (around line 4848)
const adminEmail = process.env.ADMIN_EMAIL || '';
if (!adminEmail) {
  console.error(`[CHECKOUT-ADMIN-DEBUG] ❌ ADMIN_EMAIL is empty or not set. Using default: "admin@coachwilltumbles.com"`);
}
const finalAdminEmail = adminEmail || 'admin@coachwilltumbles.com';
```

This means all admin notifications for $0 bookings are being sent to either:
1. The email address specified in the `ADMIN_EMAIL` environment variable, or
2. `admin@coachwilltumbles.com` if the variable is empty or not set

## Fix Instructions

### 1. Verify Production Logs
Check the production logs for the following entries to confirm the issue:

```
[CHECKOUT-ADMIN-DEBUG] Environment variables check:
[CHECKOUT-ADMIN-DEBUG] - ADMIN_EMAIL: NOT SET
[CHECKOUT-ADMIN-DEBUG] ❌ ADMIN_EMAIL is empty or not set. Using default: "admin@coachwilltumbles.com"
```

If these entries exist, it confirms the admin email is not properly configured in production.

### 2. Set the Correct ADMIN_EMAIL in Production

1. Access the Render dashboard for the Coach Will Gymnastics application
2. Navigate to the Environment section
3. Add or update the `ADMIN_EMAIL` environment variable with the correct administrative email address
4. Save the changes and redeploy the application

Example configuration:
```
ADMIN_EMAIL=notifications@coachwilltumbles.com  # Or whatever email is actively monitored
```

### 3. Verify the Fix

After deploying with the updated environment variable:

1. Create a test $0 reservation booking in production
2. Verify both the parent and admin emails are received at the correct addresses
3. Check the logs again to confirm the `ADMIN_EMAIL` variable is now correctly set:

```
[CHECKOUT-ADMIN-DEBUG] - ADMIN_EMAIL: notifications@coachwilltumbles.com
[CHECKOUT-ADMIN-DEBUG] Final admin email address: notifications@coachwilltumbles.com
```

You can also use the test script `test-zero-booking-emails.mjs` that was created to verify the email functionality locally:

```bash
# Run this in the production environment after updating the ADMIN_EMAIL variable
node test-zero-booking-emails.mjs
```

This script will:
1. Output the current ADMIN_EMAIL environment variable value
2. Send a test admin notification email directly using the Resend API
3. Send a test parent confirmation email
4. Confirm successful delivery with response IDs

### Alternative: Update Code to Use a Different Default

If you prefer to change the default admin email address in the code rather than setting an environment variable, you can update the following section in `server/routes.ts` (around line 4848):

```typescript
// Always use a value for admin email, falling back to the default if needed
const finalAdminEmail = adminEmail || 'notifications@coachwilltumbles.com';
```

However, using environment variables is the recommended approach as it allows for easier configuration changes without code modifications.
