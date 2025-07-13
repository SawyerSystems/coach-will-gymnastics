import { Router } from "express";

interface TimeSlotLock {
  id: string;
  date: string;
  time: string;
  parentId?: number;
  sessionId: string;
  lockedAt: Date;
  expiresAt: Date;
}

// In-memory storage for time slot locks (5-minute duration)
const timeSlotLocks = new Map<string, TimeSlotLock>();
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const timeSlotLocksRouter = Router();

// Helper function to create lock key
function getLockKey(date: string, time: string): string {
  return `${date}_${time}`;
}

// Helper function to clean expired locks
function cleanExpiredLocks() {
  const now = new Date();
  const keysToDelete: string[] = [];
  
  timeSlotLocks.forEach((lock, key) => {
    if (lock.expiresAt < now) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => timeSlotLocks.delete(key));
}

// Lock a time slot
timeSlotLocksRouter.post('/lock', (req, res) => {
  try {
    const { date, time, parentId, sessionId } = req.body;
    
    if (!date || !time || !sessionId) {
      return res.status(400).json({ 
        error: 'Missing required fields: date, time, sessionId' 
      });
    }

    cleanExpiredLocks();

    const lockKey = getLockKey(date, time);
    const existingLock = timeSlotLocks.get(lockKey);

    // Check if slot is already locked by someone else
    if (existingLock && existingLock.sessionId !== sessionId) {
      return res.status(409).json({ 
        error: 'Time slot is already locked by another user',
        expiresAt: existingLock.expiresAt 
      });
    }

    // Create or update lock
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_DURATION_MS);
    
    const lock: TimeSlotLock = {
      id: lockKey,
      date,
      time,
      parentId,
      sessionId,
      lockedAt: now,
      expiresAt
    };

    timeSlotLocks.set(lockKey, lock);

    res.json({ 
      success: true, 
      lockId: lockKey,
      expiresAt,
      message: 'Time slot locked successfully'
    });
  } catch (error) {
    console.error('Error locking time slot:', error);
    res.status(500).json({ error: 'Failed to lock time slot' });
  }
});

// Release a time slot lock
timeSlotLocksRouter.post('/release', (req, res) => {
  try {
    const { date, time, sessionId } = req.body;
    
    if (!date || !time || !sessionId) {
      return res.status(400).json({ 
        error: 'Missing required fields: date, time, sessionId' 
      });
    }

    const lockKey = getLockKey(date, time);
    const existingLock = timeSlotLocks.get(lockKey);

    // Only allow releasing if the session matches
    if (existingLock && existingLock.sessionId === sessionId) {
      timeSlotLocks.delete(lockKey);
      res.json({ success: true, message: 'Time slot lock released' });
    } else {
      res.status(404).json({ error: 'No matching lock found' });
    }
  } catch (error) {
    console.error('Error releasing time slot lock:', error);
    res.status(500).json({ error: 'Failed to release time slot lock' });
  }
});

// Check if a time slot is locked
timeSlotLocksRouter.get('/check/:date/:time', (req, res) => {
  try {
    const { date, time } = req.params;
    const { sessionId } = req.query;

    cleanExpiredLocks();

    const lockKey = getLockKey(date, time);
    const lock = timeSlotLocks.get(lockKey);

    if (!lock) {
      return res.json({ locked: false, available: true });
    }

    // If it's the same session, consider it available
    if (sessionId && lock.sessionId === sessionId) {
      return res.json({ 
        locked: true, 
        available: true, 
        ownedBySession: true,
        expiresAt: lock.expiresAt 
      });
    }

    // Locked by someone else
    res.json({ 
      locked: true, 
      available: false,
      expiresAt: lock.expiresAt 
    });
  } catch (error) {
    console.error('Error checking time slot lock:', error);
    res.status(500).json({ error: 'Failed to check time slot lock' });
  }
});

// Get all active locks (for debugging)
timeSlotLocksRouter.get('/active', (req, res) => {
  try {
    cleanExpiredLocks();
    const activeLocks = Array.from(timeSlotLocks.values());
    res.json({ locks: activeLocks, count: activeLocks.length });
  } catch (error) {
    console.error('Error getting active locks:', error);
    res.status(500).json({ error: 'Failed to get active locks' });
  }
});

// Clean expired locks (utility endpoint)
timeSlotLocksRouter.post('/cleanup', (req, res) => {
  try {
    const beforeCount = timeSlotLocks.size;
    cleanExpiredLocks();
    const afterCount = timeSlotLocks.size;
    const removed = beforeCount - afterCount;
    
    res.json({ 
      success: true, 
      removedLocks: removed,
      activeLocks: afterCount 
    });
  } catch (error) {
    console.error('Error cleaning up locks:', error);
    res.status(500).json({ error: 'Failed to cleanup locks' });
  }
});

// Auto-cleanup function that can be called periodically
export function autoCleanupExpiredLocks() {
  cleanExpiredLocks();
}

// Set up automatic cleanup every minute
setInterval(autoCleanupExpiredLocks, 60 * 1000);