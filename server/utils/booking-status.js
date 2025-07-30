/**
 * Determines a booking's status based on payment and attendance status
 * 
 * @param paymentStatus Current payment status
 * @param attendanceStatus Current attendance status
 * @returns Appropriate booking status
 */
function determineBookingStatus(paymentStatus, attendanceStatus) {
  // Handle all lowercase and case-sensitive variations
  const payment = paymentStatus.toLowerCase();
  const attendance = attendanceStatus.toLowerCase();

  // Handle reservation failures
  if (payment === 'reservation-failed') {
    return 'failed';
  }

  // Handle cancellations and refunds
  if (payment === 'reservation-refunded' || payment === 'session-refunded' || attendance === 'cancelled') {
    return 'cancelled';
  }

  // Handle completed sessions
  if (attendance === 'completed') {
    return 'completed';
  }

  // Handle no-shows (treated as completed for status simplification)
  if (attendance === 'no-show') {
    return 'completed'; // Changed from no-show to completed
  }

  // Handle confirmed sessions
  if (attendance === 'confirmed') {
    if (payment === 'reservation-paid' || payment === 'session-paid') {
      return 'confirmed';
    }
    return 'confirmed';
  }

  // Handle paid but not yet confirmed
  if (payment === 'reservation-paid' || payment === 'session-paid') {
    return 'paid';
  }

  // Handle manual entries (map to pending/confirmed based on payment status)
  if (attendance === 'manual') {
    if (payment === 'reservation-paid' || payment === 'session-paid') {
      return 'confirmed'; // Changed from manual-paid to confirmed
    }
    return 'pending'; // Changed from manual to pending
  }

  // Default case
  return 'pending';
}

module.exports = {
  determineBookingStatus
};
