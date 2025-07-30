import { Express, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { isAdminAuthenticated } from '../auth';
import { logger } from '../logger';
import { SupabaseStorage } from '../storage';

const storage = new SupabaseStorage();

export function initAdminBookingRoutes(app: Express) {
  // Admin booking creation endpoint
  app.post("/api/admin/bookings", isAdminAuthenticated, async (req: Request, res: Response) => {
    const perfTimer = logger.performance.api.request('POST', '/api/admin/bookings');
    
    try {
      console.log("Admin booking request body:", JSON.stringify(req.body, null, 2));
      
      const bookingData = req.body;
      
      // Resolve lesson type to ID
      let lessonTypeId: number | null = null;
      if (bookingData.lessonType) {
        const lessonTypeMapping: { [key: string]: number } = {
          'quick-journey': 1,
          'dual-quest': 2,  
          'deep-dive': 3,
          'partner-progression': 4
        };
        lessonTypeId = lessonTypeMapping[bookingData.lessonType] || null;
        
        if (!lessonTypeId) {
          return res.status(400).json({
            message: "Invalid lesson type",
            details: `Unknown lesson type: ${bookingData.lessonType}`
          });
        }
      }
      
      // Check if parent exists
      let parent = await storage.getParentById(bookingData.parentInfo?.id);
      
      if (!parent) {
        // Try to find parent by email
        const parentsByEmail = await storage.getParentsByEmail(bookingData.parentInfo.email);
        if (parentsByEmail.length > 0) {
          parent = parentsByEmail[0];
        } else {
          // Create parent account
          parent = await storage.createParent({
            firstName: bookingData.parentInfo.firstName,
            lastName: bookingData.parentInfo.lastName,
            email: bookingData.parentInfo.email,
            phone: bookingData.parentInfo.phone,
            emergencyContactName: bookingData.parentInfo.emergencyContactName,
            emergencyContactPhone: bookingData.parentInfo.emergencyContactPhone,
            passwordHash: await bcrypt.hash(Math.random().toString(36).slice(2), 10)
          });
        }
      }
      
      // Prepare the safety information
      const safetyInfo = bookingData.safetyContact || {};
      const dropoffInfo = {
        dropoffPersonName: safetyInfo.willDropOff 
          ? `${parent.firstName} ${parent.lastName}` 
          : safetyInfo.dropoffPersonName || '',
        dropoffPersonRelationship: safetyInfo.willDropOff 
          ? 'Parent' 
          : safetyInfo.dropoffPersonRelationship || '',
        dropoffPersonPhone: safetyInfo.willDropOff 
          ? parent.phone
          : safetyInfo.dropoffPersonPhone || ''
      };
      
      const pickupInfo = {
        pickupPersonName: safetyInfo.willPickUp 
          ? `${parent.firstName} ${parent.lastName}` 
          : safetyInfo.pickupPersonName || '',
        pickupPersonRelationship: safetyInfo.willPickUp 
          ? 'Parent' 
          : safetyInfo.pickupPersonRelationship || '',
        pickupPersonPhone: safetyInfo.willPickUp 
          ? parent.phone
          : safetyInfo.pickupPersonPhone || ''
      };

      // Create booking
      const booking = await storage.createBooking({
        parentId: parent.id,
        lessonTypeId: lessonTypeId,
        preferredDate: bookingData.selectedTimeSlot?.date || '',
        preferredTime: bookingData.selectedTimeSlot?.time || '',
        bookingMethod: 'Admin',
        status: bookingData.status || 'confirmed',
        paymentStatus: bookingData.paymentStatus || 'unpaid',
        notes: bookingData.adminNotes || '',
        ...dropoffInfo,
        ...pickupInfo,
        safetyVerificationSignedAt: new Date().toISOString()
      });

      // Debug log the booking object
      console.log('[DEBUG] Created admin booking:', booking);

      // Process athletes
      if (bookingData.athleteInfo && bookingData.athleteInfo.length > 0) {
        // For new athletes from form
        await Promise.all(bookingData.athleteInfo.map(async (athlete: any, index: number) => {
          const newAthlete = await storage.createAthlete({
            parentId: parent.id,
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            dateOfBirth: athlete.dateOfBirth,
            gender: athlete.gender || '',
            allergies: athlete.allergies || '',
            experience: athlete.experience || 'intermediate',
          });
          
          if (newAthlete) {
            await storage.addAthleteToBooking(booking.id, newAthlete.id, index + 1);
          }
        }));
      } else if (bookingData.selectedAthletes && bookingData.selectedAthletes.length > 0) {
        // For existing athletes
        await Promise.all(bookingData.selectedAthletes.map(async (athleteId: number, index: number) => {
          await storage.addAthleteToBooking(booking.id, athleteId, index + 1);
        }));
      }
      
      // Process focus areas if provided
      if (bookingData.focusAreas && bookingData.focusAreas.length > 0) {
        const focusAreaNames = bookingData.focusAreas;
        const allFocusAreas = await storage.getFocusAreas();
        
        // Map names to IDs
        const focusAreaIds = focusAreaNames
          .map(name => allFocusAreas.find(fa => fa.name === name)?.id)
          .filter(Boolean);
          
        if (focusAreaIds.length > 0) {
          await storage.addFocusAreasToBooking(booking.id, focusAreaIds);
        }
      }
      
      // Send email confirmation if needed (can be added later)
      
      perfTimer.end();
      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        booking
      });
    } catch (error) {
      perfTimer.end();
      console.error("Error creating admin booking:", error);
      return res.status(500).json({
        success: false, 
        message: "Error creating booking", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
