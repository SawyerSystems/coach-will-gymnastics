# Admin Email Fix - Lesson Type Format Issue

## Issue Identified

Based on testing a complete $0 booking flow, we've identified the issue:

1. The parent confirmation email is successfully sent for $0 bookings
2. The admin email fails to send with the following error:

```
Failed to send email: admin-new-booking to admin@coachwilltumbles.com 
Error: Objects are not valid as a React child (found: object with keys {id, name, duration, price, description, key}). 
If you meant to render a collection of children, use an array instead.
```

## Root Cause

When sending the admin email notification for $0 bookings, the `lessonType` field is being passed as a complete object rather than a string, causing the React component to fail when trying to render it.

In the debug logs:

```javascript
"lessonType": {
  "id": 1,
  "name": "Quick Journey",
  "duration": 30,
  "price": 40,
  "description": "Perfect for skill checks, focused practice, or when time is limited\n",
  "key": "quick-journey"
}
```

The React component expects `lessonType` to be a string like "Quick Journey".

## Solution

The fix is to extract the lesson type name before passing it to the email function. Update the code in `server/routes.ts` around line 4892 (in the checkout route for $0 bookings) to extract just the name from the lesson type object:

```javascript
// Current code (broken)
const lessonType = bookingWithRelations.lessonType || 'Unknown Lesson Type';

// Fixed code
const lessonType = typeof bookingWithRelations.lessonType === 'object' && bookingWithRelations.lessonType !== null
  ? bookingWithRelations.lessonType.name  // Extract name from object
  : (bookingWithRelations.lessonType || 'Unknown Lesson Type');  // Keep string or use fallback
```

## Testing Summary

1. ✅ Parent notification emails work correctly
2. ❌ Admin notification emails fail due to lesson type format issue
3. ✅ The $0 booking checkout process correctly skips Stripe and marks the booking as confirmed

After applying the fix, both parent and admin emails should send successfully for $0 bookings.
