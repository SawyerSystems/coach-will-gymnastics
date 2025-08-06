// ...existing code...
// ...existing code...
import { type Admin, type Apparatus, type ArchivedWaiver, type Athlete, type AthleteWithWaiverStatus, type Availability, type AvailabilityException, type BlogEmailSignup, type BlogPost, type Booking, type BookingWithRelations, type FocusArea, type InsertAdmin, type InsertApparatus, type InsertArchivedWaiver, type InsertAthlete, type InsertAvailability, type InsertAvailabilityException, type InsertBlogPost, type InsertBooking, type InsertFocusArea, type InsertParent, type InsertSideQuest, type InsertTip, type InsertWaiver, type Parent, type SideQuest, type Tip, type Waiver, AttendanceStatusEnum, BookingStatusEnum, PaymentStatusEnum } from "@shared/schema";
import Stripe from 'stripe';
import { supabase, supabaseAdmin } from "./supabase-client";
import { supabaseServiceRole } from "./supabase-service-role";

// Temporary types for unused auth codes (intentionally missing from database)
interface ParentAuthCode {
  id: number;
  email: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
}

interface InsertParentAuthCode {
  email: string;
  code: string;
  expiresAt: Date;
  used?: boolean;
}
export interface IStorage {
  // Archiving logic
  archiveBookingsByParentId(parentId: number, reason: string): Promise<void>;
  archiveBookingsByAthleteId(athleteId: number, reason: string): Promise<void>;
  getAllArchivedBookings(): Promise<any[]>;
  // Parents (preferred terminology)
  getAllParents(): Promise<Parent[]>;
  identifyParent(email: string, phone: string): Promise<Parent | undefined>;
  createParent(parent: InsertParent): Promise<Parent>;
  updateParent(id: number, parent: Partial<InsertParent>): Promise<Parent | undefined>;
  deleteParent(id: number): Promise<boolean>;
  getParentAthletes(parentId: number): Promise<Athlete[]>;
  getParentById(id: number): Promise<Parent | undefined>;

  // Parents (legacy compatibility)
  identifyParent(email: string, phone: string): Promise<Parent | undefined>;
  createParent(parent: InsertParent): Promise<Parent>;
  updateParent(id: number, parent: Partial<InsertParent>): Promise<Parent | undefined>;
  deleteParent(id: number): Promise<boolean>;
  getParentAthletes(parentId: number): Promise<Athlete[]>;
// ...rest of interface unchanged...

  // Lesson Types
  getAllLessonTypes(): Promise<any[]>;
  
  // Athletes
  getAllAthletes(): Promise<Athlete[]>;
  getAllAthletesWithWaiverStatus(): Promise<AthleteWithWaiverStatus[]>;
  createAthlete(athlete: InsertAthlete): Promise<Athlete>;
  getAthlete(id: number): Promise<Athlete | undefined>;
  getAthleteWithWaiverStatus(id: number): Promise<AthleteWithWaiverStatus | undefined>;
  updateAthlete(id: number, athlete: Partial<InsertAthlete>): Promise<Athlete | undefined>;
  deleteAthlete(id: number): Promise<boolean>;
  getAthleteBookingHistory(athleteId: number): Promise<Booking[]>;
  addAthleteSlot(bookingId: number, athleteId: number, slotOrder: number): Promise<void>;

  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined>;
  updateBookingStatus(id: number, status: BookingStatusEnum): Promise<Booking | undefined>;
  updateBookingPaymentStatus(id: number, paymentStatus: PaymentStatusEnum): Promise<Booking | undefined>;
  updateBookingAttendanceStatus(id: number, attendanceStatus: AttendanceStatusEnum): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  getUpcomingSessions(): Promise<{
    id: number;
    sessionDate: string;
    lessonType: string;
    parentName: string;
    athleteNames: string[];
    focusAreas: string[];
    paymentStatus: string;
    attendanceStatus: string;
  }[]>;

  // Payment Logs
  createPaymentLog(log: { bookingId: number | null; stripeEvent: string | null; errorMessage: string | null }): Promise<void>;

  // Blog Posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: InsertBlogPost): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;

  // Tips
  getAllTips(): Promise<Tip[]>;
  getTip(id: number): Promise<Tip | undefined>;
  createTip(tip: InsertTip): Promise<Tip>;
  updateTip(id: number, tip: InsertTip): Promise<Tip | undefined>;
  deleteTip(id: number): Promise<boolean>;

  // Availability
  getAllAvailability(): Promise<Availability[]>;
  getAvailability(id: number): Promise<Availability | undefined>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, availability: InsertAvailability): Promise<Availability | undefined>;
  deleteAvailability(id: number): Promise<boolean>;

  // Availability Exceptions
  getAllAvailabilityExceptions(): Promise<AvailabilityException[]>;
  getAvailabilityException(id: number): Promise<AvailabilityException | undefined>;
  createAvailabilityException(exception: InsertAvailabilityException): Promise<AvailabilityException>;
  updateAvailabilityException(id: number, exception: InsertAvailabilityException): Promise<AvailabilityException | undefined>;
  deleteAvailabilityException(id: number): Promise<boolean>;
  getAvailabilityExceptionsByDateRange(startDate: string, endDate: string): Promise<AvailabilityException[]>;

  // Admins
  getAllAdmins(): Promise<Admin[]>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdmin(id: number): Promise<Admin | undefined>;

  // Parent Authentication
  createParentAuthCode(authCode: InsertParentAuthCode): Promise<ParentAuthCode>;
  getParentAuthCode(email: string, code: string): Promise<ParentAuthCode | undefined>;
  deleteParentAuthCode(email: string): Promise<boolean>;
  markAuthCodeAsUsed(id: number): Promise<void>;
  cleanupExpiredAuthCodes(): Promise<void>;

  // Email Verification
  createVerificationToken(token: { parentId: number; token: string; expiresAt: Date }): Promise<any>;
  getVerificationToken(token: string): Promise<any>;
  markParentAsVerified(parentId: number): Promise<void>;
  deleteVerificationToken(token: string): Promise<void>;
  deleteVerificationTokensByParentId(parentId: number): Promise<void>;

  // Password Reset
  createPasswordResetToken(token: { parentId: number; token: string; expiresAt: Date }): Promise<any>;
  getPasswordResetToken(token: string): Promise<any>;
  markPasswordResetTokenAsUsed(token: string): Promise<void>;
  deletePasswordResetToken(token: string): Promise<void>;
  deletePasswordResetTokensByParentId(parentId: number): Promise<void>;

  // Slot Reservations
  getActiveReservations(date: string): Promise<{ startTime: string; lessonType: string }[]>;
  reserveSlot(date: string, startTime: string, lessonType: string, sessionId: string): Promise<boolean>;
  releaseSlot(date: string, startTime: string): Promise<boolean>;
  cleanupExpiredReservations(): Promise<void>;

  // Waivers
  createWaiver(waiver: InsertWaiver): Promise<Waiver>;
  getWaiver(id: number): Promise<Waiver | undefined>;
  getWaiverByAthleteId(athleteId: number): Promise<Waiver | undefined>;
  getWaiverByBookingId(bookingId: number): Promise<Waiver | undefined>;
  getAllWaivers(): Promise<Waiver[]>;
  updateWaiver(id: number, waiver: Partial<InsertWaiver>): Promise<Waiver | undefined>;
  updateWaiverPdfPath(id: number, pdfPath: string): Promise<Waiver | undefined>;
  updateWaiverEmailSent(id: number): Promise<Waiver | undefined>;

  // Archived Waivers
  getAllArchivedWaivers(): Promise<ArchivedWaiver[]>;
  createArchivedWaiver(waiver: InsertArchivedWaiver): Promise<ArchivedWaiver>;
  deleteArchivedWaiver(id: number): Promise<boolean>;
  archiveWaiver(waiverId: number, reason: string): Promise<ArchivedWaiver | undefined>;

  // Normalized Lookup Tables
  getAllApparatus(): Promise<Apparatus[]>;
  createApparatus(apparatus: InsertApparatus): Promise<Apparatus>;
  updateApparatus(id: number, apparatus: Partial<InsertApparatus>): Promise<Apparatus | undefined>;
  deleteApparatus(id: number): Promise<boolean>;

  getAllFocusAreas(): Promise<FocusArea[]>;
  getFocusAreasByApparatus(apparatusId: number): Promise<FocusArea[]>;
  getFocusAreasByLevel(level: string): Promise<FocusArea[]>;
  createFocusArea(focusArea: InsertFocusArea): Promise<FocusArea>;
  updateFocusArea(id: number, focusArea: Partial<InsertFocusArea>): Promise<FocusArea | undefined>;
  deleteFocusArea(id: number): Promise<boolean>;
  addBookingFocusArea(bookingId: number, focusAreaId: number | number[]): Promise<void>;

  getAllSideQuests(): Promise<SideQuest[]>;
  createSideQuest(sideQuest: InsertSideQuest): Promise<SideQuest>;
  updateSideQuest(id: number, sideQuest: Partial<InsertSideQuest>): Promise<SideQuest | undefined>;
  deleteSideQuest(id: number): Promise<boolean>;

  // Enhanced booking methods with normalized relationships
  getBookingWithRelations(id: number): Promise<BookingWithRelations | undefined>;
  getAllBookingsWithRelations(): Promise<BookingWithRelations[]>;
  createBookingWithRelations(
    booking: InsertBooking,
    apparatusIds: number[],
    focusAreaIds: number[],
    sideQuestIds: number[]
  ): Promise<BookingWithRelations>;
  updateBookingRelations(
    bookingId: number,
    apparatusIds: number[],
    focusAreaIds: number[],
    sideQuestIds: number[]
  ): Promise<BookingWithRelations | undefined>;

  // Blog Email Subscriptions
  updateParentBlogEmailOptIn(parentId: number, optIn: boolean): Promise<Parent | undefined>;
  createBlogEmailSignup(email: string): Promise<BlogEmailSignup>;
  getAllBlogEmailSignups(): Promise<BlogEmailSignup[]>;
  getAllParentsWithBlogOptIn(): Promise<Parent[]>;
  getAllBlogEmailAddresses(): Promise<string[]>;

  // Site Content Management
  getSiteContent(): Promise<any>;
  updateSiteContent(content: any): Promise<any>;
  getAllTestimonials(): Promise<any[]>;
  createTestimonial(testimonial: any): Promise<any>;
  updateTestimonial(id: number, testimonial: any): Promise<any>;
  deleteTestimonial(id: number): Promise<boolean>;
  setFeaturedTestimonial(id: number): Promise<any>;
  getAllSiteFaqs(): Promise<any[]>;
  createSiteFaq(faq: any): Promise<any>;
  updateSiteFaq(id: number, faq: any): Promise<any>;
  deleteSiteFaq(id: number): Promise<boolean>;
  bulkUpsertSiteFaqs(faqs: any[]): Promise<any[]>;
}

export class MemStorage implements IStorage {
  // Archive all bookings for a parent (stub)
  async archiveBookingsByParentId(parentId: number, reason: string): Promise<void> {
    // Not implemented in MemStorage
    return;
  }
  
  // Athlete and focus area association methods
  async addAthleteSlot(bookingId: number, athleteId: number, slotOrder: number): Promise<void> {
    throw new Error("addAthleteSlot not implemented in MemStorage");
  }
  
  async addBookingFocusArea(bookingId: number, focusAreaId: number | number[]): Promise<void> {
    throw new Error("addBookingFocusArea not implemented in MemStorage");
  }

  // Archive all bookings for an athlete (stub)
  async archiveBookingsByAthleteId(athleteId: number, reason: string): Promise<void> {
    // Not implemented in MemStorage
    return;
  }

  // Get all archived bookings (stub)
  async getAllArchivedBookings(): Promise<any[]> {
    // Not implemented in MemStorage
    return [];
  }
  
  // Get all lesson types (stub)
  async getAllLessonTypes(): Promise<any[]> {
    // Return a simple implementation for MemStorage with mock data
    return [
      {
        id: 1,
        name: "Quick Journey",
        description: "30-minute private session",
        price: 40,
        duration: 30,
        isPrivate: true,
        maxAthletes: 1,
        isActive: true
      },
      {
        id: 2,
        name: "Dual Quest",
        description: "30-minute semi-private session",
        price: 50, 
        duration: 30,
        isPrivate: false,
        maxAthletes: 2,
        isActive: true
      }
    ];
  }
  
  async getAllWaivers(): Promise<Waiver[]> {
    // In-memory stub for test/dev only
    return [];
  }
  private bookings: Map<number, Booking>;
  private blogPosts: Map<number, BlogPost>;
  private tips: Map<number, Tip>;
  private availability: Map<number, Availability>;
  private availabilityExceptions: Map<number, AvailabilityException>;
  private parents: Map<number, Parent>;
  private athletes: Map<number, Athlete>;
  private admins: Map<number, Admin>;
  private parentAuthCodes: Map<string, ParentAuthCode>;
  private waivers: Map<number, Waiver>;
  private archivedWaivers: Map<number, ArchivedWaiver>;
  private apparatus: Map<number, Apparatus>;
  private focusAreas: Map<number, FocusArea>;
  private sideQuests: Map<number, SideQuest>;
  private currentUserId: number;
  private currentBookingId: number;
  private currentBlogPostId: number;
  private currentTipId: number;
  private currentAvailabilityId: number;
  private currentAvailabilityExceptionId: number;
  private currentParentId: number;
  private currentAthleteId: number;
  private currentAdminId: number;
  private currentWaiverId: number;
  private currentArchivedWaiverId: number;
  private currentApparatusId: number;
  private currentFocusAreaId: number;
  private currentSideQuestId: number;

  constructor() {
    this.bookings = new Map();
    this.blogPosts = new Map();
    this.tips = new Map();
    this.availability = new Map();
    this.availabilityExceptions = new Map();
    this.parents = new Map();
    this.athletes = new Map();
    this.admins = new Map();
    this.parentAuthCodes = new Map();
    this.waivers = new Map();
    this.archivedWaivers = new Map();
    this.apparatus = new Map();
    this.focusAreas = new Map();
    this.sideQuests = new Map();
    this.currentUserId = 1;
    this.currentBookingId = 1;
    this.currentBlogPostId = 1;
    this.currentTipId = 1;
    this.currentAvailabilityId = 1;
    this.currentAvailabilityExceptionId = 1;
    this.currentParentId = 1;
    this.currentAthleteId = 1;
    this.currentAdminId = 1;
    this.currentWaiverId = 1;
    this.currentArchivedWaiverId = 1;
    this.currentApparatusId = 1;
    this.currentFocusAreaId = 1;
    this.currentSideQuestId = 1;

    // Initialize with some sample data
    this.initializeSampleData();
  }

  // Helper function to log queries (no-op for MemStorage)
  private logQuery(operation: string, table: string, filters?: any) {
    // No-op for in-memory storage
  }

  private initializeSampleData() {
    // Sample blog posts
    const samplePosts: Omit<BlogPost, 'id'>[] = [
      {
        title: "5 Essential Stretches for Young Gymnasts",
        content: `Flexibility is crucial for gymnastics success and injury prevention. Here are five essential stretches that every young gymnast should practice daily to improve their performance and maintain healthy muscles and joints.

**1. Pike Stretch**
Sit with legs straight out in front of you, feet together. Reach forward with your arms and try to touch your toes while keeping your knees straight. This stretch targets your hamstrings and lower back. Hold for 30 seconds and repeat 3 times.

**2. Straddle Stretch**
Sit with legs spread wide apart in a straddle position. Lean forward with your chest, keeping your back straight. This improves hip flexibility crucial for splits and leaps. Breathe deeply and hold for 30 seconds.

**3. Bridge Stretch**
Lie on your back, place hands by your ears, and push up into a bridge. This stretch opens up your shoulders and spine, essential for back walkovers and handsprings. Start with 10-15 second holds and gradually increase.

**4. Couch Stretch**
Place one foot on a couch or elevated surface behind you, with the other leg in a lunge position. This targets your hip flexors, which often get tight from tumbling. Hold for 30 seconds each leg.

**5. Shoulder Rolls and Arm Circles**
Roll your shoulders backward and forward, then make large and small circles with your arms. This keeps your shoulders healthy and prevents injury from all the overhead movements in gymnastics.

**Important Safety Tips:**
- Never force a stretch to the point of pain
- Hold each stretch for at least 20-30 seconds
- Breathe deeply throughout each stretch
- Warm up with light movement before stretching
- Be consistent - stretch daily for best results

Remember, flexibility takes time to develop. Be patient with yourself and celebrate small improvements!`,
        excerpt: "Learn these five essential stretches that every young gymnast should practice daily to improve their performance and prevent injuries.",
        category: "Tips",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        publishedAt: new Date('2024-12-10')
      },
      {
        title: "Emma's First Back Handspring Journey",
        content: `When 8-year-old Emma first walked into my gym six months ago, the idea of going backwards was absolutely terrifying to her. Like many young gymnasts, she had mastered her forward rolls and handstands but froze at the thought of a back handspring. Today, I'm thrilled to share her inspiring journey from fear to confidence.

**Month 1: Building Trust**
Emma's first lesson focused entirely on building trust - not just in me as her coach, but in her own abilities. We started with basic backward movements: backward rolls on an incline mat, walking backward on the beam, and simple back extensions on the floor. The key was making every movement feel safe and controlled.

**Month 2: Strength Development**
We dedicated this month to building the specific strength needed for back handsprings. Emma worked on hollow body holds, arch holds, and wall handstand holds. Her favorite exercise became the "rocket ship" - jumping backward from a squat position onto a stack of soft mats. This taught her the feeling of pushing backward with power.

**Month 3: The Breakthrough**
This was when Emma had her first "aha" moment. Using our overhead spotting rig, she finally felt what a complete back handspring rotation feels like. The smile on her face was priceless! We practiced this assisted version until she could do 10 in a row with confidence.

**Month 4: Reducing Assistance**
Gradually, I reduced my spotting. First, just a light touch on her back for confidence. Then, hovering my hands without touching. Emma was developing the muscle memory and spatial awareness needed for independent back handsprings.

**Month 5: First Solo Attempt**
Emma surprised both of us when she suddenly said, "Coach Will, I think I can do it by myself!" Her first solo back handspring wasn't perfect - she landed in a deep squat - but she did it! The joy and pride in her eyes reminded me why I love coaching.

**Month 6: Consistency and Confidence**
By month six, Emma could perform back handsprings consistently and was ready to connect them in series. More importantly, she had gained confidence that would help her tackle any skill in the future.

**Lessons for Parents and Gymnasts:**
- Fear is normal and okay - we work with it, not against it
- Every child progresses at their own pace
- Strength and flexibility training is just as important as skill practice
- Celebration of small victories builds confidence for bigger achievements
- Trust between coach and athlete is everything

Emma's journey reminds us that with patience, proper progression, and lots of encouragement, any goal is achievable. She's now working on her back handspring series and has her sights set on a back tuck!`,
        excerpt: "Follow Emma's inspiring 6-month journey from being afraid of going backwards to confidently performing her first back handspring.",
        category: "Story",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        publishedAt: new Date('2024-12-08')
      },
      {
        title: "Setting Up a Safe Home Practice Space",
        content: `Supporting your child's gymnastics development at home can make a huge difference in their progress. However, safety should always be the top priority. Here's your comprehensive guide to creating an effective and safe home practice space without breaking the bank.

**Essential Safety Rules First:**
Before we discuss equipment, let's establish the golden rules:
- Adult supervision is required for all gymnastics practice
- No attempting new skills at home without coach approval
- Practice only skills your child has already learned in class
- Stop immediately if anyone feels tired or unfocused

**Space Requirements:**
You'll need a minimum of 8x8 feet of clear space with 8-foot ceilings. Ideally, choose a room with:
- Soft flooring (carpet or exercise mats)
- No furniture with sharp corners nearby
- Good lighting
- Adequate ventilation

**Budget-Friendly Equipment:**

**Level 1: Basic Setup ($50-100)**
- Exercise mats (2-inch thick minimum): $30-50
- Yoga mat for stretching: $15-25
- Resistance bands for strength training: $10-15

**Level 2: Intermediate Setup ($150-300)**
- Folding gymnastics mat (4-inch thick): $100-150
- Low balance beam or tape line: $50-100
- Pull-up bar for upper body strength: $25-50

**Level 3: Advanced Setup ($300-500)**
- Gymnastics air mat: $200-300
- Adjustable parallette bars: $50-100
- Wall-mounted pull-up system: $50-100

**What NOT to Buy:**
- Trampolines (injury risk is too high)
- Cheap gymnastics equipment from big box stores
- Any equipment that promises to teach "advanced skills"
- Spring-loaded training aids

**Recommended Home Practices:**

**Flexibility Training (Daily):**
- Basic stretches from our blog post series
- Holding bridges, splits, and straddles
- Shoulder and wrist mobility exercises

**Strength Training (3x per week):**
- Hollow body holds
- Arch holds
- Push-ups and modified handstand holds against the wall
- Core strengthening exercises

**Basic Skills Review:**
- Forward and backward rolls on proper mats
- Handstand holds against the wall
- Cartwheel practice (if space allows)
- Balance and coordination drills

**Creating the Right Environment:**
Make the space inviting and fun! Consider:
- Playing upbeat music during practice
- Setting up a "gym corner" that stays consistent
- Creating a simple routine chart
- Celebrating progress with stickers or charts

**When to Practice:**
- 15-20 minutes, 3-4 times per week is ideal
- Never right after meals
- When your child is alert and energetic
- As a complement to, not replacement for, regular classes

**Red Flags to Watch For:**
- Your child attempting skills beyond their level
- Practicing when tired or distracted
- Using unsafe equipment or spaces
- Ignoring pain or discomfort

**Storage Solutions:**
Keep equipment organized and accessible:
- Wall hooks for resistance bands
- Under-bed storage for mats
- Designated bin for small equipment
- Easy setup and breakdown routine

**Working with Your Coach:**
Always communicate with your child's gymnastics coach about home practice:
- Ask which skills are appropriate for home practice
- Share any concerns or observations
- Get specific recommendations for your child's level
- Report any fears or difficulties your child mentions

Remember, the goal of home practice is to supplement, not replace, professional instruction. Focus on building strength, flexibility, and confidence in skills your child has already mastered. Most importantly, keep it fun and stress-free!

With the right setup and approach, home practice can accelerate your child's gymnastics development while building discipline and body awareness that will benefit them in all areas of life.`,
        excerpt: "Want to support your child's gymnastics practice at home? Here's how to create a safe and effective practice space without breaking the bank.",
        category: "Guide",
        imageUrl: "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
        publishedAt: new Date('2024-12-05')
      }
    ];

    samplePosts.forEach(post => {
      const id = this.currentBlogPostId++;
      this.blogPosts.set(id, { ...post, id });
    });

    // Sample tips
    const sampleTips: Omit<Tip, 'id'>[] = [
      {
        title: "Perfect Your Cartwheel",
        content: `The cartwheel is one of the fundamental skills in gymnastics, building strength, coordination, and spatial awareness. Here's how to master this essential skill step by step.`,
        sections: [
          {
            title: "Step 1: Body Position",
            content: "Start standing tall with arms raised overhead. Your body should be in a straight line from fingertips to toes. This position teaches proper alignment for the entire skill.",
            imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
          },
          {
            title: "Step 2: The Reach",
            content: "Reach toward the ground with your lead hand (right hand for right cartwheel). Your body should tilt to the side like a capital 'T'. Keep your eyes on your hand placement."
          },
          {
            title: "Step 3: Hand Placement",
            content: "Place your hands on the ground in a straight line, shoulder-width apart. Think of it as walking on a tightrope with your hands. Your first hand goes down, then your second hand follows in the same line.",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
          },
          {
            title: "Step 4: Leg Action",
            content: "Kick your back leg up and over, followed by your front leg. Your legs should pass through a perfect side split position in the air. Keep them straight and strong."
          },
          {
            title: "Step 5: The Landing",
            content: "Land one foot at a time in the same straight line as your hands. Finish standing tall with arms overhead, just like you started."
          },
          {
            title: "Common Mistakes to Avoid",
            content: "- Placing hands too close together or too far apart\n- Allowing knees to bend during the kick\n- Landing with feet too far apart\n- Rushing through the skill instead of controlling each phase"
          }
        ],
        category: "Floor Skills",
        difficulty: "Beginner",
        videoUrl: null,
        publishedAt: new Date('2024-12-01')
      },
      {
        title: "Handstand Hold Tips",
        content: `Building a strong, consistent handstand is crucial for gymnastics success. This skill develops upper body strength, body awareness, and confidence for more advanced skills.`,
        sections: [
          {
            title: "Proper Setup",
            content: "Start facing away from a wall, about 6 inches away. Place your hands flat on the ground, shoulder-width apart, with fingers spread wide for maximum stability.",
            imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
          },
          {
            title: "The Kick Up",
            content: "From your setup position, step one foot forward (your stronger leg). Kick up with your back leg while simultaneously pushing through your front leg. Aim to get your legs together in a straight line above your head."
          },
          {
            title: "Body Position",
            content: "Once inverted, focus on these key points:\n- Press firmly through your fingertips and palm\n- Engage your entire core\n- Squeeze your legs together tightly\n- Point your toes toward the ceiling\n- Keep your head in a neutral position"
          },
          {
            title: "Progressive Training",
            content: "Week 1-2: Wall handstand holds (10 seconds)\nWeek 3-4: Hollow body training (30-60 seconds)\nWeek 5-6: Chest-to-wall handstands\nWeek 7-8: Free-standing attempts with spotter"
          }
        ],
        category: "Floor Skills", 
        difficulty: "Beginner",
        videoUrl: null,
        publishedAt: new Date('2024-11-30')
      },
      {
        title: "Back Handspring Progression",
        content: `The back handspring is often considered the gateway skill to advanced tumbling. It requires strength, flexibility, spatial awareness, and courage. Here's a comprehensive progression to help you master this exciting skill safely.`,
        sections: [
          {
            title: "Prerequisites",
            content: "Before attempting back handspring training, ensure you have:\n- Consistent bridge kickover\n- Strong hollow body hold (45+ seconds)\n- Back walkover proficiency\n- Adequate shoulder flexibility\n- No fear of going backwards"
          },
          {
            title: "Phase 1: Foundation Building",
            content: "Back Extension Rolls: Start lying on your back. Roll backward and push through your hands to land on your feet.\n\nBridge Kickovers: From a standing bridge, kick one leg over to land in a lunge.\n\nWall Walks: Start in a bridge with feet against the wall.",
            imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
          },
          {
            title: "Phase 2: Standing Back Handspring",
            content: "With a qualified spotter, practice the standing back handspring motion. Focus on:\n- Starting position with arms overhead\n- Sitting back slightly\n- Reaching back while jumping up and back\n- Hand contact shoulder-width apart\n- Pushing through hands to land"
          },
          {
            title: "Phase 3: Independence",
            content: "Gradually reduce spotter assistance. Start with a firm spot, then light touch, then just hands nearby for confidence. Focus on power development and mental preparation."
          }
        ],
        category: "Floor Skills",
        difficulty: "Intermediate",
        videoUrl: null,
        publishedAt: new Date('2024-11-28')
      },
      {
        title: "Balance Beam Confidence Building",
        content: `The balance beam can be intimidating, but with proper progression and mental training, any gymnast can develop confidence and skill on this apparatus.`,
        sections: [
          {
            title: "Start Low, Build High",
            content: "Begin all new skills on a floor line or low beam (2-4 inches high) before progressing to regulation height. This allows you to focus on technique without fear.",
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
          },
          {
            title: "Mental Preparation",
            content: "- Visualize successful completion before mounting the beam\n- Use positive self-talk ('I am strong and balanced')\n- Practice deep breathing to stay calm and focused\n- Start each session with skills you've already mastered"
          },
          {
            title: "Basic Positions",
            content: "Relevé Walk: Walk on the balls of your feet with arms in high V.\n\nStraight Leg Kicks: Kick to horizontal while maintaining perfect posture.\n\nPassé Balance: Balance on one leg with the other foot at your knee for 10 seconds."
          },
          {
            title: "Progression Steps",
            content: "1. Master skills on floor line first\n2. Progress to low beam with mats on both sides\n3. Gradually increase beam height\n4. Remove safety mats when confident"
          }
        ],
        category: "Beam",
        difficulty: "Beginner",
        videoUrl: null,
        publishedAt: new Date('2024-11-25')
      }
    ];

    sampleTips.forEach(tip => {
      const id = this.currentTipId++;
      this.tips.set(id, { ...tip, id });
    });

    // Initialize sample availability (weekly schedule)
    const sampleAvailability = [
      // Monday
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isRecurring: true, isAvailable: true },
      // Tuesday  
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isRecurring: true, isAvailable: true },
      // Wednesday
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isRecurring: true, isAvailable: true },
      // Thursday
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isRecurring: true, isAvailable: true },
      // Friday
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isRecurring: true, isAvailable: true },
      // Saturday
      { dayOfWeek: 6, startTime: "08:00", endTime: "16:00", isRecurring: true, isAvailable: true },
    ];

    sampleAvailability.forEach(availability => {
      const id = this.currentAvailabilityId++;
      this.availability.set(id, { 
        ...availability, 
        id, 
        createdAt: new Date()
      });
    });
  }

  // Parent management (stub implementations for compatibility)
  async identifyParent(email: string, phone: string): Promise<Parent | undefined> {
    // Stub implementation - actual logic is in routes using booking data
    return undefined;
  }

  async createParent(parent: InsertParent): Promise<Parent> {
    throw new Error("Parent management not implemented in MemStorage");
  }

  async updateParent(id: number, parent: Partial<InsertParent>): Promise<Parent | undefined> {
    throw new Error("Parent management not implemented in MemStorage");
  }

  async deleteParent(id: number): Promise<boolean> {
    throw new Error("Parent management not implemented in MemStorage");
  }

  async getParentAthletes(parentId: number): Promise<Athlete[]> {
    throw new Error("Parent management not implemented in MemStorage");
  }

  // Parent methods (preferred terminology - get all parents)
  async getAllParents(): Promise<Parent[]> {
    return [];
  }

  // Athlete management (stub implementations for compatibility)
  async getAllAthletes(): Promise<Athlete[]> {
    throw new Error("Athlete management not implemented in MemStorage");
  }

  async createAthlete(athlete: InsertAthlete): Promise<Athlete> {
    throw new Error("Athlete management not implemented in MemStorage");
  }

  async getAthlete(id: number): Promise<Athlete | undefined> {
    throw new Error("Athlete management not implemented in MemStorage");
  }

  async updateAthlete(id: number, athlete: Partial<InsertAthlete>): Promise<Athlete | undefined> {
    throw new Error("Athlete management not implemented in MemStorage");
  }

  async deleteAthlete(id: number): Promise<boolean> {
    throw new Error("Athlete management not implemented in MemStorage");
  }

  async getAthleteBookingHistory(athleteId: number): Promise<Booking[]> {
    throw new Error("Athlete management not implemented in MemStorage");
  }

  async getAllAthletesWithWaiverStatus(): Promise<AthleteWithWaiverStatus[]> {
    throw new Error("Athlete waiver status not implemented in MemStorage");
  }

  async getAthleteWithWaiverStatus(id: number): Promise<AthleteWithWaiverStatus | undefined> {
    throw new Error("Athlete waiver status not implemented in MemStorage");
  }

  // Bookings
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    
    // Extract parent name and phone for safety fields
    const parentFullName = 
      (insertBooking.parentFirstName && insertBooking.parentLastName) ? 
      `${insertBooking.parentFirstName} ${insertBooking.parentLastName}` : 
      "";
    const parentPhone = insertBooking.parentPhone || "";
    
    const booking: Booking = { 
      ...insertBooking,
      id,
      athleteId: insertBooking.athleteId || null, // Ensure athleteId is included
      waiverId: insertBooking.waiverId ?? null,  // Ensure waiverId is properly set
      createdAt: new Date(),
      updatedAt: new Date(),
      status: BookingStatusEnum.PENDING,
      paymentStatus: PaymentStatusEnum.UNPAID,
      attendanceStatus: AttendanceStatusEnum.PENDING,
      // Convert Date to string format for compatibility
      preferredDate: insertBooking.preferredDate instanceof Date ? 
        insertBooking.preferredDate.toISOString().split('T')[0] : 
        insertBooking.preferredDate,
      // Map focusAreaIds to focusAreas for backward compatibility
      focusAreas: Array.isArray(insertBooking.focusAreaIds) ? insertBooking.focusAreaIds.map(String) : [],
      focusAreaOther: insertBooking.focusAreaOther || null,
      // Ensure required fields are set for legacy athlete fields
      athlete1Allergies: Array.isArray(insertBooking.athletes) && insertBooking.athletes[0] ? insertBooking.athletes[0].allergies : null,
      athlete2Name: Array.isArray(insertBooking.athletes) && insertBooking.athletes[1] ? insertBooking.athletes[1].name : null,
      athlete2DateOfBirth: Array.isArray(insertBooking.athletes) && insertBooking.athletes[1] ? insertBooking.athletes[1].dateOfBirth : null,
      athlete2Allergies: Array.isArray(insertBooking.athletes) && insertBooking.athletes[1] ? insertBooking.athletes[1].allergies : null,
      athlete2Experience: Array.isArray(insertBooking.athletes) && insertBooking.athletes[1] ? insertBooking.athletes[1].experience : null,
      // Remove waiver fields - they're now in separate waivers table
      reservationFeePaid: insertBooking.reservationFeePaid ?? false,
      paidAmount: insertBooking.paidAmount ?? "0",
      specialRequests: insertBooking.specialRequests ?? null,
      adminNotes: insertBooking.adminNotes ?? null,
      // Safety verification fields
      dropoffPersonName: insertBooking.dropoffPersonName || parentFullName || "Parent",
      dropoffPersonRelationship: insertBooking.dropoffPersonRelationship || "Parent",
      dropoffPersonPhone: insertBooking.dropoffPersonPhone || parentPhone || "000-000-0000",
      pickupPersonName: insertBooking.pickupPersonName || parentFullName || "Parent",
      pickupPersonRelationship: insertBooking.pickupPersonRelationship || "Parent",
      pickupPersonPhone: insertBooking.pickupPersonPhone || parentPhone || "000-000-0000",
      altPickupPersonName: insertBooking.altPickupPersonName ?? null,
      altPickupPersonRelationship: insertBooking.altPickupPersonRelationship ?? null,
      altPickupPersonPhone: insertBooking.altPickupPersonPhone ?? null,
      safetyVerificationSigned: insertBooking.safetyVerificationSigned ?? false,
      safetyVerificationSignedAt: insertBooking.safetyVerificationSignedAt ?? null,
      progressNote: insertBooking.progressNote ?? null,
      coachName: insertBooking.coachName ?? "Coach Will",
      stripeSessionId: insertBooking.stripeSessionId ?? null
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getAllBookingsWithRelations(): Promise<BookingWithRelations[]> {
    // For in-memory storage, return bookings with empty relations (mainly for testing)
    const bookings = await this.getAllBookings();
    return bookings.map(booking => ({
      ...booking,
      apparatus: [],
      focusAreas: [],
      sideQuests: [],
      athletes: [],
      parent: undefined,
      lessonType: undefined,
      waiver: undefined,
    })) as BookingWithRelations[];
  }

  async getUpcomingSessions(): Promise<{
    id: number;
    sessionDate: string;
    lessonType: string;
    parentName: string;
    athleteNames: string[];
    focusAreas: string[];
    paymentStatus: string;
    attendanceStatus: string;
  }[]> {
    // For in-memory storage, return empty array (this is mainly for testing)
    return [];
  }

  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      Object.assign(booking, data);
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  async updateBookingStatus(id: number, status: BookingStatusEnum): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  async updateBookingPaymentStatus(id: number, paymentStatus: PaymentStatusEnum): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.paymentStatus = paymentStatus;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  async updateBookingAttendanceStatus(id: number, attendanceStatus: AttendanceStatusEnum): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.attendanceStatus = attendanceStatus;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    return this.bookings.delete(id);
  }

  // Payment Logs
  async createPaymentLog(log: { bookingId: number | null; stripeEvent: string | null; errorMessage: string | null }): Promise<void> {
    // In-memory storage doesn't persist payment logs
    console.log('Payment log:', log);
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort((a, b) => 
      b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.currentBlogPostId++;
    const post: BlogPost = { 
      ...insertPost, 
      id,
      publishedAt: new Date(),
      imageUrl: insertPost.imageUrl ?? null
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: number, insertPost: InsertBlogPost): Promise<BlogPost | undefined> {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) {
      return undefined;
    }
    const updatedPost: BlogPost = {
      ...existingPost,
      ...insertPost,
      id,
      imageUrl: insertPost.imageUrl ?? null
    };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  // Tips
  async getAllTips(): Promise<Tip[]> {
    return Array.from(this.tips.values()).sort((a, b) => 
      b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }

  async getTip(id: number): Promise<Tip | undefined> {
    return this.tips.get(id);
  }

  async createTip(insertTip: InsertTip): Promise<Tip> {
    const id = this.currentTipId++;
    const tip: Tip = { 
      ...insertTip, 
      id,
      publishedAt: new Date(),
      videoUrl: insertTip.videoUrl ?? null,
      sections: insertTip.sections ?? null
    };
    this.tips.set(id, tip);
    return tip;
  }

  async updateTip(id: number, insertTip: InsertTip): Promise<Tip | undefined> {
    const existingTip = this.tips.get(id);
    if (!existingTip) {
      return undefined;
    }
    const updatedTip: Tip = {
      ...existingTip,
      ...insertTip,
      id,
      videoUrl: insertTip.videoUrl ?? null,
      sections: insertTip.sections ?? null
    };
    this.tips.set(id, updatedTip);
    return updatedTip;
  }

  async deleteTip(id: number): Promise<boolean> {
    return this.tips.delete(id);
  }

  // Availability
  async getAllAvailability(): Promise<Availability[]> {
    return Array.from(this.availability.values()).sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  async getAvailability(id: number): Promise<Availability | undefined> {
    return this.availability.get(id);
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.currentAvailabilityId++;
    const availability: Availability = { 
      ...insertAvailability, 
      id,
      createdAt: new Date(),
      isRecurring: insertAvailability.isRecurring ?? true,
      isAvailable: insertAvailability.isAvailable ?? true
    };
    this.availability.set(id, availability);
    return availability;
  }

  async updateAvailability(id: number, insertAvailability: InsertAvailability): Promise<Availability | undefined> {
    const existing = this.availability.get(id);
    if (!existing) return undefined;

    const updated: Availability = {
      ...existing,
      ...insertAvailability,
      id
    };
    this.availability.set(id, updated);
    return updated;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    return this.availability.delete(id);
  }

  // Availability Exceptions
  async getAllAvailabilityExceptions(): Promise<AvailabilityException[]> {
    return Array.from(this.availabilityExceptions.values()).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  }

  async getAvailabilityException(id: number): Promise<AvailabilityException | undefined> {
    return this.availabilityExceptions.get(id);
  }

  async createAvailabilityException(insertException: InsertAvailabilityException): Promise<AvailabilityException> {
    const id = this.currentAvailabilityExceptionId++;
    const exception: AvailabilityException = { 
      ...insertException, 
      id,
      createdAt: new Date(),
      // Convert Date to string format for compatibility
      date: insertException.date instanceof Date ? 
        insertException.date.toISOString().split('T')[0] : 
        insertException.date,
      reason: insertException.reason ?? null,
      isAvailable: insertException.isAvailable ?? false
    };
    this.availabilityExceptions.set(id, exception);
    return exception;
  }

  async updateAvailabilityException(id: number, insertException: InsertAvailabilityException): Promise<AvailabilityException | undefined> {
    const existing = this.availabilityExceptions.get(id);
    if (!existing) return undefined;

    const updated: AvailabilityException = {
      ...existing,
      ...insertException,
      id,
      // Convert Date to string format for compatibility
      date: insertException.date instanceof Date ? 
        insertException.date.toISOString().split('T')[0] : 
        insertException.date,
      reason: insertException.reason ?? null
    };
    this.availabilityExceptions.set(id, updated);
    return updated;
  }

  async deleteAvailabilityException(id: number): Promise<boolean> {
    return this.availabilityExceptions.delete(id);
  }

  async getAvailabilityExceptionsByDateRange(startDate: string, endDate: string): Promise<AvailabilityException[]> {
    return Array.from(this.availabilityExceptions.values())
      .filter(exception => exception.date >= startDate && exception.date <= endDate)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  }

  // Admin methods
  async getAllAdmins(): Promise<Admin[]> {
    return [];
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    throw new Error("Admin creation not implemented in MemStorage");
  }

  async getAdmin(id: number): Promise<Admin | undefined> {
    return undefined;
  }

  // Waiver methods - Not implemented in MemStorage
  async createWaiver(waiver: InsertWaiver): Promise<Waiver> {
    throw new Error("Waiver creation not implemented in MemStorage");
  }

  async getWaiver(id: number): Promise<Waiver | undefined> {
    return undefined;
  }

  async getWaiverByAthleteId(athleteId: number): Promise<Waiver | undefined> {
    return undefined;
  }

  async getWaiverByBookingId(bookingId: number): Promise<Waiver | undefined> {
    return undefined;
  }

// ...existing code...
  async updateWaiver(id: number, waiver: Partial<InsertWaiver>): Promise<Waiver | undefined> {
    return undefined;
  }

  async updateWaiverPdfPath(id: number, pdfPath: string): Promise<Waiver | undefined> {
    return undefined;
  }

  async updateWaiverEmailSent(id: number): Promise<Waiver | undefined> {
    return undefined;
  }

  // Archived waiver methods - Not implemented in MemStorage
  async getAllArchivedWaivers(): Promise<ArchivedWaiver[]> {
    return [];
  }

  async createArchivedWaiver(waiver: InsertArchivedWaiver): Promise<ArchivedWaiver> {
    throw new Error("Archived waiver creation not implemented in MemStorage");
  }

  async deleteArchivedWaiver(id: number): Promise<boolean> {
    return false; // Not implemented in MemStorage
  }

  async archiveWaiver(waiverId: number, reason: string): Promise<ArchivedWaiver | undefined> {
    return undefined;
  }

  // Parent auth methods - Not implemented in MemStorage
  async getParentById(id: number): Promise<Parent | undefined> {
    return undefined;
  }

  async createParentAuthCode(authCode: InsertParentAuthCode): Promise<ParentAuthCode> {
    throw new Error("Parent auth code creation not implemented in MemStorage");
  }

  async getParentAuthCode(email: string, code: string): Promise<ParentAuthCode | undefined> {
    return undefined;
  }

  async deleteParentAuthCode(email: string): Promise<boolean> {
    return true; // Not implemented in MemStorage
  }

  async markAuthCodeAsUsed(id: number): Promise<void> {
    // Not implemented
  }

  async cleanupExpiredAuthCodes(): Promise<void> {
    // Not implemented
  }
  
  // Password reset token methods - Not implemented in MemStorage
  async createPasswordResetToken(token: { parentId: number; token: string; expiresAt: Date }): Promise<any> {
    throw new Error("Password reset token creation not implemented in MemStorage");
  }
  
  async getPasswordResetToken(token: string): Promise<any> {
    return undefined;
  }
  
  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    // Not implemented
  }
  
  async deletePasswordResetToken(token: string): Promise<void> {
    // Not implemented
  }
  
  async deletePasswordResetTokensByParentId(parentId: number): Promise<void> {
    // Not implemented
  }

  // Slot reservation methods - Not implemented in MemStorage
  async getActiveReservations(date: string): Promise<{ startTime: string; lessonType: string }[]> {
    return [];
  }

  async reserveSlot(date: string, startTime: string, lessonType: string, sessionId: string): Promise<boolean> {
    return false;
  }

  async releaseSlot(date: string, startTime: string): Promise<boolean> {
    return false;
  }

  async cleanupExpiredReservations(): Promise<void> {
    // Not implemented
  }

  // Missing methods that need to be implemented
  async getAllApparatus(): Promise<Apparatus[]> {
    return Array.from(this.apparatus.values());
  }

  async createApparatus(apparatus: InsertApparatus): Promise<Apparatus> {
    const id = this.currentApparatusId++;
    const newApparatus: Apparatus = {
      ...apparatus,
      id,
      createdAt: new Date(),
      sortOrder: apparatus.sortOrder || 0
    };
    this.apparatus.set(id, newApparatus);
    return newApparatus;
  }

  async updateApparatus(id: number, apparatus: Partial<InsertApparatus>): Promise<Apparatus | undefined> {
    const existing = this.apparatus.get(id);
    if (!existing) return undefined;
    
    const updated: Apparatus = {
      ...existing,
      ...apparatus,
      id
    };
    this.apparatus.set(id, updated);
    return updated;
  }

  async deleteApparatus(id: number): Promise<boolean> {
    return this.apparatus.delete(id);
  }

  async getAllFocusAreas(): Promise<FocusArea[]> {
    return Array.from(this.focusAreas.values());
  }

  async getFocusAreasByApparatus(apparatusId: number): Promise<FocusArea[]> {
    return Array.from(this.focusAreas.values()).filter(fa => (fa as any).apparatusId === apparatusId);
  }
  
  async getFocusAreasByLevel(level: string): Promise<FocusArea[]> {
    const allFocusAreas = Array.from(this.focusAreas.values());
    
    if (level === 'beginner') {
      return allFocusAreas.filter(fa => fa.level === 'beginner');
    } else if (level === 'intermediate') {
      return allFocusAreas.filter(fa => ['beginner', 'intermediate'].includes(fa.level || 'intermediate'));
    } else {
      // For advanced, return all levels
      return allFocusAreas;
    }
  }

  async createFocusArea(focusArea: InsertFocusArea): Promise<FocusArea> {
    const id = this.currentFocusAreaId++;
    const newFocusArea: FocusArea = {
      ...focusArea,
      id,
      createdAt: new Date(),
      sortOrder: focusArea.sortOrder || 0,
      apparatusId: focusArea.apparatusId || null,
      level: focusArea.level || 'intermediate'
    };
    this.focusAreas.set(id, newFocusArea);
    return newFocusArea;
  }

  async updateFocusArea(id: number, focusArea: Partial<InsertFocusArea>): Promise<FocusArea | undefined> {
    const existing = this.focusAreas.get(id);
    if (!existing) return undefined;
    
    const updated: FocusArea = {
      ...existing,
      ...focusArea,
      id
    };
    this.focusAreas.set(id, updated);
    return updated;
  }

  async deleteFocusArea(id: number): Promise<boolean> {
    return this.focusAreas.delete(id);
  }

  async getAllSideQuests(): Promise<SideQuest[]> {
    return Array.from(this.sideQuests.values());
  }

  async createSideQuest(sideQuest: InsertSideQuest): Promise<SideQuest> {
    const id = this.currentSideQuestId++;
    const newSideQuest: SideQuest = {
      ...sideQuest,
      id,
      createdAt: new Date(),
      sortOrder: sideQuest.sortOrder || 0
    };
    this.sideQuests.set(id, newSideQuest);
    return newSideQuest;
  }

  async updateSideQuest(id: number, sideQuest: Partial<InsertSideQuest>): Promise<SideQuest | undefined> {
    const existing = this.sideQuests.get(id);
    if (!existing) return undefined;
    
    const updated: SideQuest = {
      ...existing,
      ...sideQuest,
      id
    };
    this.sideQuests.set(id, updated);
    return updated;
  }

  async deleteSideQuest(id: number): Promise<boolean> {
    return this.sideQuests.delete(id);
  }

  // Enhanced booking methods with normalized relationships - stub implementations
  async getBookingWithRelations(id: number): Promise<BookingWithRelations | undefined> {
    const booking = await this.getBooking(id);
    if (!booking) return undefined;
    
    return {
      ...booking,
      apparatus: [],
      focusAreas: [],
      sideQuests: []
    } as BookingWithRelations;
  }

  // getAllBookingsWithRelations implementation moved to the normalized section below

  async createBookingWithRelations(
    booking: InsertBooking,
    apparatusIds: number[],
    focusAreaIds: number[],
    sideQuestIds: number[]
  ): Promise<BookingWithRelations> {
    const createdBooking = await this.createBooking(booking);
    return {
      ...createdBooking,
      apparatus: [],
      focusAreas: [],
      sideQuests: []
    } as BookingWithRelations;
  }

  async updateBookingRelations(
    bookingId: number,
    apparatusIds: number[],
    focusAreaIds: number[],
    sideQuestIds: number[]
  ): Promise<BookingWithRelations | undefined> {
    const booking = await this.getBooking(bookingId);
    if (!booking) return undefined;
    
    return {
      ...booking,
      apparatus: [],
      focusAreas: [],
      sideQuests: []
    } as BookingWithRelations;
  }

  // Email verification methods - Not implemented in MemStorage
  async createVerificationToken(token: { parentId: number; token: string; expiresAt: Date }): Promise<any> {
    throw new Error("Verification token creation not implemented in MemStorage");
  }

  async getVerificationToken(token: string): Promise<any> {
    return undefined;
  }

  async markParentAsVerified(parentId: number): Promise<void> {
    // Not implemented
  }

  async deleteVerificationToken(token: string): Promise<void> {
    // Not implemented
  }

  async deleteVerificationTokensByParentId(parentId: number): Promise<void> {
    // Not implemented
  }

  // Blog Email Subscriptions (MemStorage - not implemented)
  async updateParentBlogEmailOptIn(parentId: number, optIn: boolean): Promise<Parent | undefined> {
    // Not implemented in MemStorage
    return undefined;
  }

  async createBlogEmailSignup(email: string): Promise<BlogEmailSignup> {
    // Not implemented in MemStorage
    throw new Error("MemStorage does not support blog email signups");
  }

  async getAllBlogEmailSignups(): Promise<BlogEmailSignup[]> {
    // Not implemented in MemStorage
    return [];
  }

  async getAllParentsWithBlogOptIn(): Promise<Parent[]> {
    // Not implemented in MemStorage
    return [];
  }

  async getAllBlogEmailAddresses(): Promise<string[]> {
    // Not implemented in MemStorage
    return [];
  }

  // Site Content Management Methods (stubs for MemStorage)
  async getSiteContent(): Promise<any> {
    return {
      bannerVideo: '',
      heroImages: [],
      about: {
        bio: 'Coach Will brings nearly 10 years of passionate gymnastics instruction to every lesson.',
        experience: 'Nearly 10 years of coaching experience with athletes of all levels',
        certifications: [
          { title: 'USA Gymnastics Certified', body: 'Official certification from USA Gymnastics' },
          { title: 'CPR/First Aid Certified', body: 'Current safety and emergency response training' },
          { title: 'Background Checked', body: 'Comprehensive background verification completed' }
        ]
      },
      contact: {
        phone: '(585) 755-8122',
        email: 'Admin@coachwilltumbles.com',
        address: {
          name: 'Oceanside Gymnastics',
          street: '1935 Ave. del Oro #A',
          city: 'Oceanside',
          state: 'CA',
          zip: '92056'
        }
      },
      hours: {
        monday: { available: true, start: '9:00 AM', end: '4:00 PM' },
        tuesday: { available: true, start: '9:00 AM', end: '3:30 PM' },
        wednesday: { available: true, start: '9:00 AM', end: '4:00 PM' },
        thursday: { available: true, start: '9:00 AM', end: '3:30 PM' },
        friday: { available: true, start: '9:00 AM', end: '4:00 PM' },
        saturday: { available: true, start: '10:00 AM', end: '2:00 PM' },
        sunday: { available: false, start: '', end: '' }
      },
      testimonials: [],
      faqs: []
    };
  }

  async updateSiteContent(content: any): Promise<any> {
    // Not implemented in MemStorage
    return content;
  }

  async getAllTestimonials(): Promise<any[]> {
    // Not implemented in MemStorage
    return [];
  }

  async createTestimonial(testimonial: any): Promise<any> {
    // Not implemented in MemStorage
    return { id: 1, ...testimonial };
  }

  async updateTestimonial(id: number, testimonial: any): Promise<any> {
    // Not implemented in MemStorage
    return { id, ...testimonial };
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    // Not implemented in MemStorage
    return true;
  }

  async setFeaturedTestimonial(id: number): Promise<any> {
    // Not implemented in MemStorage
    return { id, featured: true };
  }

  async getAllSiteFaqs(): Promise<any[]> {
    // Not implemented in MemStorage
    return [];
  }

  async createSiteFaq(faq: any): Promise<any> {
    // Not implemented in MemStorage
    return { id: 1, ...faq };
  }

  async updateSiteFaq(id: number, faq: any): Promise<any> {
    // Not implemented in MemStorage
    return { id, ...faq };
  }

  async deleteSiteFaq(id: number): Promise<boolean> {
    // Not implemented in MemStorage
    return true;
  }
}

// Supabase Storage Implementation
export class SupabaseStorage implements IStorage {
  // Archive all bookings for a parent
  async archiveBookingsByParentId(parentId: number, reason: string): Promise<void> {
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('parent_id', parentId);
    if (error) {
      console.error('Error fetching bookings for archiving:', error);
      return;
    }
    if (!bookings) return;
    for (const booking of bookings) {
      await supabaseServiceRole.from('archived_bookings').insert({
        ...booking,
        original_booking_id: booking.id,
        archived_at: new Date().toISOString(),
        archive_reason: reason
      });
    }
  }

  // Archive all bookings for an athlete
  async archiveBookingsByAthleteId(athleteId: number, reason: string): Promise<void> {
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('athlete_id', athleteId);
    if (error) {
      console.error('Error fetching bookings for archiving:', error);
      return;
    }
    if (!bookings) return;
    for (const booking of bookings) {
      await supabaseServiceRole.from('archived_bookings').insert({
        ...booking,
        original_booking_id: booking.id,
        archived_at: new Date().toISOString(),
        archive_reason: reason
      });
    }
  }

  // Fetch all archived bookings
  async getAllArchivedBookings(): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('archived_bookings')
      .select('*')
      .order('archived_at', { ascending: false });
    if (error) {
      console.error('Error fetching archived bookings:', error);
      return [];
    }
    return data || [];
  }
  // Helper function to log queries
  private logQuery(operation: string, table: string, filters?: any) {
    console.log('[SQL]', `${operation} FROM ${table}`, filters ? JSON.stringify(filters) : '');
  }

  // Parent methods (preferred terminology)
  async getAllParents(): Promise<Parent[]> {
    this.logQuery('SELECT', 'parents');
    const { data, error } = await supabaseAdmin
      .from('parents')
      .select('id, first_name, last_name, email, phone, emergency_contact_name, emergency_contact_phone, created_at, updated_at, password_hash, is_verified, blog_emails')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching parents:', error);
      return [];
    }

    // Transform snake_case to camelCase
    return (data || []).map(parent => ({
      id: parent.id,
      firstName: parent.first_name,
      lastName: parent.last_name,
      email: parent.email,
      phone: parent.phone,
      emergencyContactName: parent.emergency_contact_name,
      emergencyContactPhone: parent.emergency_contact_phone,
      passwordHash: parent.password_hash || null,
      isVerified: parent.is_verified || false,
      blogEmails: parent.blog_emails || false,
      createdAt: parent.created_at,
      updatedAt: parent.updated_at,
    }));
  }

  async identifyParent(email: string, phone: string): Promise<Parent | undefined> {
    // Normalize email to lower case for comparison
    const emailLower = email.toLowerCase();
    const { data, error } = await supabaseAdmin
      .from('parents')
      .select('id, first_name, last_name, email, phone, emergency_contact_name, emergency_contact_phone, created_at, updated_at, password_hash, is_verified, blog_emails')
      .or(`email.ilike.${emailLower},phone.eq.${phone}`)
      .single();

    if (error) {
      // If not found, that's expected behavior, don't log as error
      return undefined;
    }

    // Transform snake_case to camelCase
    return data ? {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      emergencyContactName: data.emergency_contact_name,
      emergencyContactPhone: data.emergency_contact_phone,
      passwordHash: data.password_hash || null,
      isVerified: data.is_verified || false,
      blogEmails: data.blog_emails || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } : undefined;
  }


  async createParent(insertParent: InsertParent): Promise<Parent> {
    // Validate required fields
    if (!insertParent.email) {
      throw new Error("Email is required to create a parent");
    }
    if (!insertParent.firstName) {
      throw new Error("First name is required to create a parent");
    }
    if (!insertParent.lastName) {
      throw new Error("Last name is required to create a parent");
    }
    if (!insertParent.phone) {
      throw new Error("Phone number is required to create a parent");
    }

    // Always store email in lower case
    const supabaseData = {
      first_name: insertParent.firstName,
      last_name: insertParent.lastName,
      email: insertParent.email.toLowerCase(),
      password_hash: insertParent.passwordHash || '', // new field
      is_verified: insertParent.isVerified || false, // new field
      phone: insertParent.phone,
      emergency_contact_name: insertParent.emergencyContactName || 'Not Provided',
      emergency_contact_phone: insertParent.emergencyContactPhone || 'Not Provided',
      // Remove waiver fields - they're now in separate waivers table
    };

    const { data, error } = await supabaseServiceRole
      .from('parents')
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating parent:', error);
      throw error;
    }

    // Always return a Parent object (never undefined)
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      emergencyContactName: data.emergency_contact_name,
      emergencyContactPhone: data.emergency_contact_phone,
      passwordHash: data.password_hash || null,
      isVerified: data.is_verified || false,
      blogEmails: data.blog_emails || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getParentByEmail(email: string): Promise<Parent | undefined> {
    const { data, error } = await supabaseAdmin
      .from('parents')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // not found is not an error
        console.error('Error fetching parent by email:', error);
      }
      return undefined;
    }
    return data ? {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      emergencyContactName: data.emergency_contact_name,
      emergencyContactPhone: data.emergency_contact_phone,
      passwordHash: data.password_hash || null,
      isVerified: data.is_verified || false,
      blogEmails: data.blog_emails || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } : undefined;
  }

  async updateParent(id: number, updateData: Partial<InsertParent>): Promise<Parent | undefined> {
    // If updating email, always store in lower case
    const updateDataNormalized = { ...updateData };
    if (updateDataNormalized.email) {
      updateDataNormalized.email = updateDataNormalized.email.toLowerCase();
    }
    const { data, error } = await supabaseAdmin
      .from('parents')
      .update(updateDataNormalized)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating parent:', error);
      return undefined;
    }

    return data ? {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      emergencyContactName: data.emergency_contact_name,
      emergencyContactPhone: data.emergency_contact_phone,
      passwordHash: data.password_hash || null,
      isVerified: data.is_verified || false,
      blogEmails: data.blog_emails || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } : undefined;
  }

  async deleteParent(id: number): Promise<boolean> {
    // Cascade delete all athletes for this parent
    const athletes = await this.getParentAthletes(id);
    for (const athlete of athletes) {
      await this.deleteAthlete(athlete.id);
    }
    const { error } = await supabaseAdmin
      .from('parents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting parent:', error);
      return false;
    }

    return true;
  }

  async getParentAthletes(parentId: number): Promise<Athlete[]> {
    const { data, error } = await supabaseAdmin
      .from('athletes')
      .select('*')
      .eq('parent_id', parentId)
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching parent athletes:', error);
      return [];
    }

    if (!data) return [];

    // Map snake_case to camelCase for frontend compatibility
    return data.map(athlete => ({
      id: athlete.id,
      parentId: athlete.parent_id,
      name: athlete.name,
      firstName: athlete.first_name,
      lastName: athlete.last_name,
      dateOfBirth: athlete.date_of_birth,
      gender: athlete.gender || null,
      allergies: athlete.allergies,
      experience: athlete.experience,
      photo: athlete.photo,
      createdAt: new Date(athlete.created_at),
      updatedAt: new Date(athlete.updated_at),
      latestWaiverId: athlete.latest_waiver_id || null,
      waiverStatus: athlete.waiver_status || 'pending',
      waiverSigned: athlete.waiver_signed || false
    }));
  }

  // Lesson Types
  async getAllLessonTypes(): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('lesson_types')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching all lesson types:', error);
      return [];
    }

    return data.map(lt => ({
      id: lt.id,
      name: lt.name,
      description: lt.description,
      price: parseFloat(lt.total_price || '0'),
      duration: lt.duration_minutes,
      isPrivate: lt.is_private,
      maxAthletes: lt.max_athletes || (lt.is_private ? 1 : 2),
      isActive: lt.is_active !== false // Default to true if not set
    }));
  }

  // Athletes
  async getAllAthletes(): Promise<Athlete[]> {
    const { data, error } = await supabaseAdmin
      .from('athletes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all athletes:', error);
      return [];
    }

    if (!data) return [];

    // Map snake_case to camelCase for frontend compatibility
    return data.map(athlete => ({
      id: athlete.id,
      parentId: athlete.parent_id,
      name: athlete.name,
      firstName: athlete.first_name,
      lastName: athlete.last_name,
      dateOfBirth: athlete.date_of_birth,
      gender: athlete.gender || null,
      allergies: athlete.allergies,
      experience: athlete.experience,
      photo: athlete.photo,
      createdAt: new Date(athlete.created_at),
      updatedAt: new Date(athlete.updated_at),
      latestWaiverId: athlete.latest_waiver_id || null,
      waiverStatus: athlete.waiver_status || 'pending',
      waiverSigned: athlete.waiver_signed || false
    }));
  }

  async getAllAthletesWithWaiverStatus(): Promise<AthleteWithWaiverStatus[]> {
    this.logQuery('SELECT', 'athletes_with_waiver_status view');
    const { data, error } = await supabaseAdmin
      .from('athletes_with_waiver_status')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching athletes with waiver status:', error);
      return [];
    }

    if (!data) return [];

    // Map snake_case to camelCase for frontend compatibility
    return data.map(athlete => ({
      id: athlete.id,
      parentId: athlete.parent_id,
      name: athlete.name,
      firstName: athlete.first_name,
      lastName: athlete.last_name,
      dateOfBirth: athlete.date_of_birth,
      gender: athlete.gender,
      allergies: athlete.allergies,
      experience: athlete.experience,
      photo: athlete.photo,
      createdAt: new Date(athlete.created_at),
      updatedAt: new Date(athlete.updated_at),
      latestWaiverId: athlete.latest_waiver_id,
      waiverStatus: athlete.waiver_status,
      waiverSigned: athlete.waiver_signed || false,
      // Remove direct waiver timestamp from athlete - now from waivers table
      waiverSignatureId: athlete.waiver_signature_id,
      waiverSignatureData: athlete.waiver_signature_data,
      waiverSignerName: athlete.waiver_signer_name,
      waiverCreatedAt: athlete.waiver_created_at,
      computedWaiverStatus: athlete.computed_waiver_status
    }));
  }

  async getAthleteWithWaiverStatus(id: number): Promise<AthleteWithWaiverStatus | undefined> {
    this.logQuery('SELECT', 'athletes_with_waiver_status view', { id });
    const { data, error } = await supabaseAdmin
      .from('athletes_with_waiver_status')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching athlete with waiver status:', error);
      return undefined;
    }

    if (!data) return undefined;

    // Map snake_case to camelCase for frontend compatibility
    return {
      id: data.id,
      parentId: data.parent_id,
      name: data.name,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      allergies: data.allergies,
      experience: data.experience,
      photo: data.photo,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      latestWaiverId: data.latest_waiver_id,
      waiverStatus: data.waiver_status,
      waiverSigned: data.waiver_signed || false,
      // Remove direct waiver timestamp from athlete - now from waivers table
      waiverSignatureId: data.waiver_signature_id,
      waiverSignatureData: data.waiver_signature_data,
      waiverSignerName: data.waiver_signer_name,
      waiverCreatedAt: data.waiver_created_at,
      computedWaiverStatus: data.computed_waiver_status
    };
  }

  async createAthlete(insertAthlete: InsertAthlete): Promise<Athlete> {
    // Map camelCase to snake_case for Supabase
    const supabaseData = {
      name: insertAthlete.name,
      first_name: insertAthlete.firstName,
      last_name: insertAthlete.lastName,
      parent_id: insertAthlete.parentId,
      date_of_birth: insertAthlete.dateOfBirth,
      // gender: insertAthlete.gender || null, // Temporarily disabled until column is added
      allergies: insertAthlete.allergies,
      experience: insertAthlete.experience,
      photo: insertAthlete.photo || null
    };

    // Use supabaseAdmin to bypass RLS when creating athletes from admin interface
    const { data, error } = await supabaseAdmin
      .from('athletes')
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating athlete:', error);
      throw error;
    }

    return data;
  }

  async getAthlete(id: number): Promise<Athlete | undefined> {
    const { data, error } = await supabaseAdmin
      .from('athletes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching athlete:', error);
      return undefined;
    }

    if (!data) return undefined;

    // Map snake_case to camelCase for frontend compatibility
    return {
      id: data.id,
      parentId: data.parent_id,
      name: data.name,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender || null,
      allergies: data.allergies,
      experience: data.experience,
      photo: data.photo,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      latestWaiverId: data.latest_waiver_id || null,
      waiverStatus: data.waiver_status || 'pending',
      waiverSigned: data.waiver_signed || false
    };
  }

  async updateAthlete(id: number, updateData: Partial<InsertAthlete>): Promise<Athlete | undefined> {
    console.log('[STORAGE-UPDATE-ATHLETE] Starting update:', { id, updateData });
    
    // Map camelCase to snake_case for DB update
    const dbUpdate: Record<string, any> = {};
    if (updateData.firstName !== undefined) dbUpdate.first_name = updateData.firstName;
    if (updateData.lastName !== undefined) dbUpdate.last_name = updateData.lastName;
    if (updateData.parentId !== undefined) dbUpdate.parent_id = updateData.parentId;
    if (updateData.dateOfBirth !== undefined) dbUpdate.date_of_birth = updateData.dateOfBirth;
    if (updateData.gender !== undefined) dbUpdate.gender = updateData.gender;
    if (updateData.name !== undefined) dbUpdate.name = updateData.name;
    if (updateData.allergies !== undefined) dbUpdate.allergies = updateData.allergies;
    if (updateData.experience !== undefined) dbUpdate.experience = updateData.experience;
    if (updateData.photo !== undefined) dbUpdate.photo = updateData.photo;
    if (updateData.latestWaiverId !== undefined) dbUpdate.latest_waiver_id = updateData.latestWaiverId;
    if (updateData.waiverStatus !== undefined) dbUpdate.waiver_status = updateData.waiverStatus;
    if (updateData.waiverSigned !== undefined) dbUpdate.waiver_signed = updateData.waiverSigned;

    console.log('[STORAGE-UPDATE-ATHLETE] DB update object:', dbUpdate);

    // Use supabaseAdmin to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('athletes')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();

    console.log('[STORAGE-UPDATE-ATHLETE] Supabase response:', { 
      success: !error, 
      error: error?.message, 
      data: data ? { id: data.id, name: data.name || data.first_name + ' ' + data.last_name } : null 
    });

    if (error) {
      console.error('Error updating athlete:', error);
      // Forward error for route to handle
      throw error;
    }

    if (!data) return undefined;

    // Transform snake_case to camelCase for frontend compatibility (SAME AS getAthlete)
    const transformedAthlete = {
      id: data.id,
      parentId: data.parent_id,
      name: data.name,
      firstName: data.first_name,
      lastName: data.last_name,
      dateOfBirth: data.date_of_birth,
      gender: data.gender || null,
      allergies: data.allergies,
      experience: data.experience,
      photo: data.photo,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      latestWaiverId: data.latest_waiver_id || null,
      waiverStatus: data.waiver_status || 'pending',
      waiverSigned: data.waiver_signed || false
    };

    console.log('[STORAGE-UPDATE-ATHLETE] Returning transformed athlete:', {
      id: transformedAthlete.id,
      firstName: transformedAthlete.firstName,
      lastName: transformedAthlete.lastName,
      allergies: transformedAthlete.allergies
    });

    return transformedAthlete;
  }

  async deleteAthlete(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('athletes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting athlete:', error);
      return false;
    }

    return true;
  }

  async getAthleteBookingHistory(athleteId: number): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('athlete1_name', athleteId.toString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching athlete booking history:', error);
      return [];
    }

    return data || [];
  }

  // Bookings
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    // Map camelCase to snake_case for database (normalized schema with foreign keys)
    const dbBooking: any = {
      parent_id: insertBooking.parentId,
      lesson_type_id: insertBooking.lessonTypeId,
      waiver_id: insertBooking.waiverId,
      preferred_date: insertBooking.preferredDate,
      preferred_time: insertBooking.preferredTime,
      status: insertBooking.status || 'pending',
      payment_status: insertBooking.paymentStatus || 'unpaid',
      attendance_status: insertBooking.attendanceStatus || 'pending',
      booking_method: insertBooking.bookingMethod || 'Website',
      reservation_fee_paid: insertBooking.reservationFeePaid || false,
      paid_amount: insertBooking.paidAmount || 0
    };

    // Optional fields
    if (insertBooking.dropoffPersonName) dbBooking.dropoff_person_name = insertBooking.dropoffPersonName;
    if (insertBooking.dropoffPersonRelationship) dbBooking.dropoff_person_relationship = insertBooking.dropoffPersonRelationship;
    if (insertBooking.dropoffPersonPhone) dbBooking.dropoff_person_phone = insertBooking.dropoffPersonPhone;
    if (insertBooking.pickupPersonName) dbBooking.pickup_person_name = insertBooking.pickupPersonName;
    if (insertBooking.pickupPersonRelationship) dbBooking.pickup_person_relationship = insertBooking.pickupPersonRelationship;
    if (insertBooking.pickupPersonPhone) dbBooking.pickup_person_phone = insertBooking.pickupPersonPhone;
    if (insertBooking.altPickupPersonName) dbBooking.alt_pickup_person_name = insertBooking.altPickupPersonName;
    if (insertBooking.altPickupPersonRelationship) dbBooking.alt_pickup_person_relationship = insertBooking.altPickupPersonRelationship;
    if (insertBooking.altPickupPersonPhone) dbBooking.alt_pickup_person_phone = insertBooking.altPickupPersonPhone;
    if (insertBooking.safetyVerificationSigned) dbBooking.safety_verification_signed = insertBooking.safetyVerificationSigned;
    if (insertBooking.safetyVerificationSignedAt) dbBooking.safety_verification_signed_at = insertBooking.safetyVerificationSignedAt;
    if (insertBooking.specialRequests) dbBooking.special_requests = insertBooking.specialRequests;
    if (insertBooking.adminNotes) dbBooking.admin_notes = insertBooking.adminNotes;
    if (insertBooking.stripeSessionId) dbBooking.stripe_session_id = insertBooking.stripeSessionId;

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert(dbBooking)
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    if (!data) throw new Error('No data returned from booking creation');

    const booking = this.mapBookingFromDb(data);
    
    // Create athlete records and booking_athletes relationships if athletes provided
    if (insertBooking.athletes && Array.isArray(insertBooking.athletes) && insertBooking.athletes.length > 0) {
      for (let i = 0; i < insertBooking.athletes.length; i++) {
        const athleteData = insertBooking.athletes[i];
        
        // Create athlete if athleteId is not provided
        let athleteId = athleteData.athleteId;
        
        if (!athleteId) {
          // For new user flow, parent might not exist yet - create parent first
          let parent = await this.identifyParent(
            String(insertBooking.parentEmail || ''), 
            String(insertBooking.parentPhone || '')
          );
          
          if (!parent) {
            // Create parent account
            parent = await this.createParent({
              firstName: String((insertBooking as any).parentFirstName || ''),
              lastName: String((insertBooking as any).parentLastName || ''),
              email: String((insertBooking as any).parentEmail || ''),
              phone: String((insertBooking as any).parentPhone || ''),
              emergencyContactName: String((insertBooking as any).emergencyContactName || ''),
              emergencyContactPhone: String((insertBooking as any).emergencyContactPhone || ''),
              passwordHash: await import('bcryptjs').then(bcrypt => bcrypt.hash(Math.random().toString(36).slice(2), 10)),
            });
          }
          
          const newAthlete = await this.createAthlete({
            parentId: parent.id,
            name: athleteData.name,
            firstName: athleteData.name.split(' ')[0],
            lastName: athleteData.name.split(' ').slice(1).join(' ') || '',
            dateOfBirth: athleteData.dateOfBirth,
            gender: athleteData.gender,
            allergies: athleteData.allergies,
            experience: athleteData.experience as "beginner" | "intermediate" | "advanced",
            photo: athleteData.photo
          });
          athleteId = newAthlete.id;
        }
        
        // Create booking_athletes relationship
        try {
          const { error: athleteInsertError } = await supabaseAdmin
            .from('booking_athletes')
            .insert({
              booking_id: booking.id,
              athlete_id: athleteId,
              slot_order: athleteData.slotOrder || (i + 1)
            });
            
          if (athleteInsertError) {
            console.error(`Error linking athlete ${athleteId} to booking ${booking.id}:`, athleteInsertError);
            throw new Error(`Failed to link athlete ${athleteId} to booking ${booking.id}: ${athleteInsertError.message}`);
          }
        } catch (err) {
          console.error(`Exception linking athlete ${athleteId} to booking ${booking.id}:`, err);
          throw err;
        }
      }
    }

    // Create focus area relationships if provided
    if (insertBooking.focusAreaIds && Array.isArray(insertBooking.focusAreaIds) && insertBooking.focusAreaIds.length > 0) {
      const focusAreaInserts = insertBooking.focusAreaIds.map((focusAreaId: number) => ({
        booking_id: booking.id,
        focus_area_id: focusAreaId
      }));
      
      try {
        const { error: focusAreaInsertError } = await supabaseAdmin
          .from('booking_focus_areas')
          .insert(focusAreaInserts);
          
        if (focusAreaInsertError) {
          console.error(`Error adding focus areas to booking ${booking.id}:`, focusAreaInsertError);
          // Continue execution instead of throwing to not block the whole booking
        }
      } catch (err) {
        console.error(`Exception adding focus areas to booking ${booking.id}:`, err);
        // Continue execution instead of throwing to not block the whole booking
      }
    }

    // Create apparatus relationships if provided
    if (insertBooking.apparatusIds && Array.isArray(insertBooking.apparatusIds) && insertBooking.apparatusIds.length > 0) {
      const apparatusInserts = insertBooking.apparatusIds.map((apparatusId: number) => ({
        booking_id: booking.id,
        apparatus_id: apparatusId
      }));
      
      try {
        const { error: apparatusInsertError } = await supabaseAdmin
          .from('booking_apparatus')
          .insert(apparatusInserts);
          
        if (apparatusInsertError) {
          console.error(`Error adding apparatus to booking ${booking.id}:`, apparatusInsertError);
          // Continue execution instead of throwing to not block the whole booking
        }
      } catch (err) {
        console.error(`Exception adding apparatus to booking ${booking.id}:`, err);
        // Continue execution instead of throwing to not block the whole booking
      }
    }

    // Create side quest relationships if provided
    if (insertBooking.sideQuestIds && Array.isArray(insertBooking.sideQuestIds) && insertBooking.sideQuestIds.length > 0) {
      const sideQuestInserts = insertBooking.sideQuestIds.map((sideQuestId: number) => ({
        booking_id: booking.id,
        side_quest_id: sideQuestId
      }));
      
      try {
        const { error: sideQuestInsertError } = await supabaseAdmin
          .from('booking_side_quests')
          .insert(sideQuestInserts);
          
        if (sideQuestInsertError) {
          console.error(`Error adding side quests to booking ${booking.id}:`, sideQuestInsertError);
          // Continue execution instead of throwing to not block the whole booking
        }
      } catch (err) {
        console.error(`Exception adding side quests to booking ${booking.id}:`, err);
        // Continue execution instead of throwing to not block the whole booking
      }
    }

    return booking;
  }

  private mapBookingFromDb(data: any): Booking {
    return {
      id: data.id,
      parentId: data.parent_id,
      athleteId: data.athlete_id,
      lessonTypeId: data.lesson_type_id,
      waiverId: data.waiver_id,
      // Legacy fields for backward compatibility - these will be empty/undefined for normalized bookings
      athlete1Name: '',
      athlete1DateOfBirth: '',
      athlete1Allergies: null,
      athlete1Experience: '',
      athlete2Name: null,
      athlete2DateOfBirth: null,
      athlete2Allergies: null,
      athlete2Experience: null,
      parentFirstName: undefined,
      parentLastName: undefined,
      parentEmail: undefined,
      parentPhone: undefined,
      emergencyContactName: undefined,
      emergencyContactPhone: undefined,
      focusAreas: [], // Now handled via booking_focus_areas junction table
      focusAreaOther: data.focus_area_other,
      amount: undefined, // Now calculated from lesson type
      preferredDate: data.preferred_date,
      preferredTime: data.preferred_time,
      status: data.status,
      paymentStatus: data.payment_status,
      attendanceStatus: data.attendance_status,
      bookingMethod: data.booking_method,
      reservationFeePaid: data.reservation_fee_paid || false,
      paidAmount: data.paid_amount?.toString() || "0.00",
      specialRequests: data.special_requests,
      adminNotes: data.admin_notes,
      dropoffPersonName: data.dropoff_person_name,
      dropoffPersonRelationship: data.dropoff_person_relationship,
      dropoffPersonPhone: data.dropoff_person_phone,
      pickupPersonName: data.pickup_person_name,
      pickupPersonRelationship: data.pickup_person_relationship,
      pickupPersonPhone: data.pickup_person_phone,
      altPickupPersonName: data.alt_pickup_person_name,
      altPickupPersonRelationship: data.alt_pickup_person_relationship,
      altPickupPersonPhone: data.alt_pickup_person_phone,
      safetyVerificationSigned: data.safety_verification_signed || false,
      safetyVerificationSignedAt: data.safety_verification_signed_at,
      progressNote: data.progress_note || null,
      coachName: data.coach_name || "Coach Will",
      stripeSessionId: data.stripe_session_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return undefined;
    }

    if (!data) return undefined;

    // Map from snake_case to camelCase
    return this.mapBookingFromDb(data);
  }

  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all bookings:', error);
      return [];
    }

    if (!data) return [];

    // Map all bookings from snake_case to camelCase
    return data.map((booking: any) => this.mapBookingFromDb(booking));
  }

  async getUpcomingSessions(): Promise<{
    id: number;
    sessionDate: string;
    sessionTime: string;
    lessonType: string;
    parentName: string;
    athleteNames: string[];
    focusAreas: string[];
    paymentStatus: string;
    attendanceStatus: string;
  }[]> {
    try {
      // Get bookings from today onwards with parent and athlete data
      const { data: bookingsData, error: bookingsError } = await supabaseAdmin
        .from('bookings')
        .select(`
          id,
          preferred_date,
          preferred_time,
          lesson_type_id,
          payment_status,
          attendance_status,
          parent_id
        `)
        .gte('preferred_date', new Date().toISOString().split('T')[0])
        .order('preferred_date', { ascending: true });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return [];
      }

      if (!bookingsData || bookingsData.length === 0) {
        return [];
      }

      // Get parent data for all bookings
      const parentIds = Array.from(new Set(bookingsData.map(b => b.parent_id)));
      const { data: parentsData, error: parentsError } = await supabaseAdmin
        .from('parents')
        .select('id, first_name, last_name')
        .in('id', parentIds);

      if (parentsError) {
        console.error('Error fetching parents:', parentsError);
      }

      // Get lesson type data for all bookings (include total_price)
      const lessonTypeIds = Array.from(new Set(bookingsData.map(b => b.lesson_type_id).filter(Boolean)));
      const { data: lessonTypesData, error: lessonTypesError } = await supabaseAdmin
        .from('lesson_types')
        .select('id, name, total_price')
        .in('id', lessonTypeIds);

      if (lessonTypesError) {
        console.error('Error fetching lesson types:', lessonTypesError);
      }

      // Get athlete data for all bookings
      const bookingIds = bookingsData.map(b => b.id);
      const { data: bookingAthletesData, error: bookingAthletesError } = await supabaseAdmin
        .from('booking_athletes')
        .select(`
          booking_id,
          athletes:athlete_id (
            id,
            first_name,
            last_name
          )
        `)
        .in('booking_id', bookingIds);

      if (bookingAthletesError) {
        console.error('Error fetching booking athletes:', bookingAthletesError);
      }

      // Get focus areas for all bookings
      const { data: bookingFocusAreasData, error: bookingFocusAreasError } = await supabaseAdmin
        .from('booking_focus_areas')
        .select(`
          booking_id,
          focus_areas!inner (
            name
          )
        `)
        .in('booking_id', bookingIds);

      if (bookingFocusAreasError) {
        console.error('Error fetching booking focus areas:', bookingFocusAreasError);
      }

      // Create lookup maps
      const parentsMap = new Map();
      parentsData?.forEach(parent => {
        parentsMap.set(parent.id, `${parent.first_name} ${parent.last_name}`);
      });

      const lessonTypesMap = new Map();
      lessonTypesData?.forEach(lessonType => {
        lessonTypesMap.set(lessonType.id, lessonType);
      });

      const athletesMap = new Map();
      bookingAthletesData?.forEach(ba => {
        if (!athletesMap.has(ba.booking_id)) {
          athletesMap.set(ba.booking_id, []);
        }
        if (ba.athletes && typeof ba.athletes === 'object' && 'first_name' in ba.athletes) {
          const athlete = ba.athletes as any;
          athletesMap.get(ba.booking_id)!.push(`${athlete.first_name} ${athlete.last_name}`);
        }
      });

      // Create focus areas map
      const focusAreasMap = new Map();
      bookingFocusAreasData?.forEach(bfa => {
        if (!focusAreasMap.has(bfa.booking_id)) {
          focusAreasMap.set(bfa.booking_id, []);
        }
        if (bfa.focus_areas && typeof bfa.focus_areas === 'object' && 'name' in bfa.focus_areas) {
          const focusArea = bfa.focus_areas as any;
          focusAreasMap.get(bfa.booking_id)!.push(focusArea.name);
        }
      });

      // Transform to expected format
      return bookingsData.map(booking => {
        const lessonTypeObj = lessonTypesMap.get(booking.lesson_type_id);
        return {
          id: booking.id,
          sessionDate: booking.preferred_date,
          sessionTime: booking.preferred_time || 'TBD',
          lessonType: lessonTypeObj?.name || 'Unknown',
          totalPrice: lessonTypeObj?.total_price ? lessonTypeObj.total_price.toString() : '0',
          parentName: parentsMap.get(booking.parent_id) || 'Unknown Parent',
          athleteNames: athletesMap.get(booking.id) || [],
          focusAreas: focusAreasMap.get(booking.id) || [],
          paymentStatus: booking.payment_status || 'unpaid',
          attendanceStatus: booking.attendance_status || 'pending'
        };
      });

    } catch (error) {
      console.error('Error in getUpcomingSessions:', error);
      return [];
    }
  }

  async updateBooking(id: number, data: Partial<Booking>): Promise<Booking | undefined> {
    // Map camelCase to snake_case for database update
    const dbUpdate: any = {};

    // Map all possible update fields
    if (data.status !== undefined) dbUpdate.status = data.status;
    if (data.paymentStatus !== undefined) dbUpdate.payment_status = data.paymentStatus;
    if (data.attendanceStatus !== undefined) dbUpdate.attendance_status = data.attendanceStatus;
    if (data.stripeSessionId !== undefined) dbUpdate.stripe_session_id = data.stripeSessionId;
    if (data.paidAmount !== undefined) dbUpdate.paid_amount = data.paidAmount;
    if (data.reservationFeePaid !== undefined) dbUpdate.reservation_fee_paid = data.reservationFeePaid;
    // Remove waiver fields - they're now in separate waivers table
    if (data.adminNotes !== undefined) dbUpdate.admin_notes = data.adminNotes;
    if (data.specialRequests !== undefined) dbUpdate.special_requests = data.specialRequests;
    // Add missing fields for reschedule functionality
    if (data.preferredDate !== undefined) dbUpdate.preferred_date = data.preferredDate;
    if (data.preferredTime !== undefined) dbUpdate.preferred_time = data.preferredTime;
    if (data.focusAreas !== undefined) dbUpdate.focus_areas = data.focusAreas;
    
    // Safety information fields
    if (data.dropoffPersonName !== undefined) dbUpdate.dropoff_person_name = data.dropoffPersonName;
    if (data.dropoffPersonRelationship !== undefined) dbUpdate.dropoff_person_relationship = data.dropoffPersonRelationship;
    if (data.dropoffPersonPhone !== undefined) dbUpdate.dropoff_person_phone = data.dropoffPersonPhone;
    if (data.pickupPersonName !== undefined) dbUpdate.pickup_person_name = data.pickupPersonName;
    if (data.pickupPersonRelationship !== undefined) dbUpdate.pickup_person_relationship = data.pickupPersonRelationship;
    if (data.pickupPersonPhone !== undefined) dbUpdate.pickup_person_phone = data.pickupPersonPhone;
    if (data.altPickupPersonName !== undefined) dbUpdate.alt_pickup_person_name = data.altPickupPersonName;
    if (data.altPickupPersonRelationship !== undefined) dbUpdate.alt_pickup_person_relationship = data.altPickupPersonRelationship;
    if (data.altPickupPersonPhone !== undefined) dbUpdate.alt_pickup_person_phone = data.altPickupPersonPhone;
    
    // Safety verification fields
    if (data.safetyVerificationSigned !== undefined) dbUpdate.safety_verification_signed = data.safetyVerificationSigned;
    if (data.safetyVerificationSignedAt !== undefined) dbUpdate.safety_verification_signed_at = data.safetyVerificationSignedAt;

    // Update the updated_at timestamp
    dbUpdate.updated_at = new Date().toISOString();

    const { data: updatedBooking, error } = await supabaseAdmin
      .from('bookings')
      .update(dbUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return undefined;
    }

    if (!updatedBooking) return undefined;

    // Map the response back to camelCase
    return this.mapBookingFromDb(updatedBooking);
  }

  async updateBookingStatus(id: number, status: BookingStatusEnum): Promise<Booking | undefined> {
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      return undefined;
    }

    return booking ? this.mapBookingFromDb(booking) : undefined;
  }

  async updateBookingPaymentStatus(id: number, paymentStatus: PaymentStatusEnum): Promise<Booking | undefined> {
    console.log('[STORAGE] Updating booking payment status:', { id, paymentStatus });
    
    // Determine if we should set reservation_fee_paid based on payment status
    const reservationFeePaid = 
      paymentStatus === PaymentStatusEnum.RESERVATION_PAID || 
      paymentStatus === PaymentStatusEnum.SESSION_PAID;
    
    const updateData: any = { 
      payment_status: paymentStatus
    };
    
    // Set reservation_fee_paid = true when appropriate
    if (reservationFeePaid) {
      updateData.reservation_fee_paid = true;
      console.log('[STORAGE] Setting reservation_fee_paid = true for status:', paymentStatus);
    }
    
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking payment status:', error);
      return undefined;
    }

    console.log('[STORAGE] Successfully updated booking payment status:', { id, paymentStatus });
    return booking ? this.mapBookingFromDb(booking) : undefined;
  }

  async updateBookingAttendanceStatus(id: number, attendanceStatus: AttendanceStatusEnum): Promise<Booking | undefined> {
    console.log('[STORAGE] Updating booking attendance status:', { id, attendanceStatus });
    
    // Enhanced logging for debugging
    console.log(`[STORAGE-DEBUG] UPDATING attendance_status to ${attendanceStatus} for booking ID ${id}`);
    
    // Use service role key for privileged operations to bypass RLS
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .update({ attendance_status: attendanceStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking attendance status:', error);
      console.error('Supabase error details:', JSON.stringify(error));
      return undefined;
    }

    if (!booking) {
      console.error(`[STORAGE-ERROR] No booking returned after update for ID ${id}`);
      return undefined;
    }

    console.log(`[STORAGE] Successfully updated booking attendance status to "${attendanceStatus}" for ID ${id}`);
    return booking ? this.mapBookingFromDb(booking) : undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    try {
      // First delete related records in junction tables
      // 1. Delete booking-athlete associations
      const { error: athleteSlotError } = await supabaseAdmin
        .from('booking_athletes')
        .delete()
        .eq('booking_id', id);
        
      if (athleteSlotError) {
        console.error('Error deleting booking athlete slots:', athleteSlotError);
      }
      
      // 2. Delete booking-focus area associations
      const { error: focusAreaError } = await supabaseAdmin
        .from('booking_focus_areas')
        .delete()
        .eq('booking_id', id);
        
      if (focusAreaError) {
        console.error('Error deleting booking focus areas:', focusAreaError);
      }
      
      // 3. Delete booking-apparatus associations
      const { error: apparatusError } = await supabaseAdmin
        .from('booking_apparatus')
        .delete()
        .eq('booking_id', id);
        
      if (apparatusError) {
        console.error('Error deleting booking apparatus:', apparatusError);
      }
      
      // 4. Delete booking-side quest associations
      const { error: sideQuestError } = await supabaseAdmin
        .from('booking_side_quests')
        .delete()
        .eq('booking_id', id);
        
      if (sideQuestError) {
        console.error('Error deleting booking side quests:', sideQuestError);
      }
      
      // Finally delete the booking itself
      const { error } = await supabaseAdmin
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting booking:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error in deleteBooking:', error);
      return false;
    }
  }

  // Payment Logs
  async createPaymentLog(log: { bookingId: number | null; stripeEvent: string | null; errorMessage: string | null }): Promise<void> {
    const { error } = await supabaseAdmin
      .from('payment_logs')
      .insert({
        booking_id: log.bookingId,
        stripe_event: log.stripeEvent,
        error_message: log.errorMessage
      });

    if (error) {
      console.error('Error creating payment log:', error);
    }
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    try {
      console.log('🔍 Attempting to fetch blog posts from Supabase...');

      const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: true });

      if (error) {
        console.error('❌ Supabase error fetching blog posts:', error);
        throw error;
      }

      console.log('✅ Successfully fetched blog posts:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching blog posts:', error);
      throw error;
    }
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      return undefined;
    }

    return data || undefined;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        ...insertPost,
        image_url: insertPost.imageUrl ?? null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }

    return data;
  }

  async updateBlogPost(id: number, insertPost: InsertBlogPost): Promise<BlogPost | undefined> {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        ...insertPost,
        image_url: insertPost.imageUrl ?? null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      return undefined;
    }

    return data || undefined;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }

    return true;
  }

  // Tips
  async getAllTips(): Promise<Tip[]> {
    try {
      console.log('🔍 Attempting to fetch tips from Supabase...');

      const { data, error } = await supabaseAdmin
        .from('tips')
        .select('*')
        .order('published_at', { ascending: true });

      if (error) {
        console.error('❌ Supabase error fetching tips:', error);
        throw error;
      }

      console.log('✅ Successfully fetched tips:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching tips:', error);
      return [];
    }
  }

  async getTip(id: number): Promise<Tip | undefined> {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tip:', error);
      return undefined;
    }

    return data || undefined;
  }

  async createTip(insertTip: InsertTip): Promise<Tip> {
    const { data, error } = await supabaseAdmin
      .from('tips')
      .insert({
        ...insertTip,
        video_url: insertTip.videoUrl ?? null,
        sections: insertTip.sections ?? null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tip:', error);
      throw error;
    }

    return data;
  }

  async updateTip(id: number, insertTip: InsertTip): Promise<Tip | undefined> {
    const { data, error } = await supabaseAdmin
      .from('tips')
      .update({
        ...insertTip,
        video_url: insertTip.videoUrl ?? null,
        sections: insertTip.sections ?? null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tip:', error);
      return undefined;
    }

    return data || undefined;
  }

  async deleteTip(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('tips')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tip:', error);
      return false;
    }

    return true;
  }

  // Availability
  async getAllAvailability(): Promise<Availability[]> {
    const { data, error } = await supabaseAdmin
      .from('availability')
      .select('*')
      .order('day_of_week')
      .order('start_time');

    if (error) {
      console.error('Error fetching availability:', error);
      return [];
    }

    // Map snake_case back to camelCase for the response
    return (data || []).map(item => ({
      id: item.id,
      dayOfWeek: item.day_of_week,
      startTime: item.start_time,
      endTime: item.end_time,
      isRecurring: item.is_recurring,
      isAvailable: item.is_available,
      createdAt: new Date(item.created_at),
    }));
  }

  async getAvailability(id: number): Promise<Availability | undefined> {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching availability:', error);
      return undefined;
    }

    // Map snake_case back to camelCase for the response
    return {
      id: data.id,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      isRecurring: data.is_recurring,
      isAvailable: data.is_available,
      createdAt: new Date(data.created_at),
    };
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    // Map camelCase to snake_case for database insertion
    const dbData = {
      day_of_week: insertAvailability.dayOfWeek,
      start_time: insertAvailability.startTime,
      end_time: insertAvailability.endTime,
      is_recurring: insertAvailability.isRecurring ?? true,
      is_available: insertAvailability.isAvailable ?? true,
    };

    const { data, error } = await supabaseAdmin
      .from('availability')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating availability:', error);
      throw new Error('Failed to create availability');
    }

    // Map snake_case back to camelCase for the response
    return {
      id: data.id,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      isRecurring: data.is_recurring,
      isAvailable: data.is_available,
      createdAt: new Date(data.created_at),
    };
  }

  async updateAvailability(id: number, insertAvailability: InsertAvailability): Promise<Availability | undefined> {
    // Map camelCase to snake_case for database update
    const dbData = {
      day_of_week: insertAvailability.dayOfWeek,
      start_time: insertAvailability.startTime,
      end_time: insertAvailability.endTime,
      is_recurring: insertAvailability.isRecurring ?? true,
      is_available: insertAvailability.isAvailable ?? true,
    };

    const { data, error } = await supabaseAdmin
      .from('availability')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating availability:', error);
      return undefined;
    }

    // Map snake_case back to camelCase for the response
    return {
      id: data.id,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      isRecurring: data.is_recurring,
      isAvailable: data.is_available,
      createdAt: new Date(data.created_at),
    };
  }

  async deleteAvailability(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('availability')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting availability:', error);
      return false;
    }

    return true;
  }

  // Availability Exceptions
  async getAllAvailabilityExceptions(): Promise<AvailabilityException[]> {
    const { data, error } = await supabaseAdmin
      .from('availability_exceptions')
      .select('*')
      .order('date')
      .order('start_time');

    if (error) {
      console.error('Error fetching availability exceptions:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      isAvailable: row.is_available,
      reason: row.reason,
      createdAt: row.created_at
    }));
  }

  async getAvailabilityException(id: number): Promise<AvailabilityException | undefined> {
    const { data, error } = await supabase
      .from('availability_exceptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching availability exception:', error);
      return undefined;
    }

    if (!data) return undefined;
    return {
      id: data.id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      isAvailable: data.is_available,
      reason: data.reason,
      createdAt: data.created_at
    };
  }

  async createAvailabilityException(insertException: InsertAvailabilityException): Promise<AvailabilityException> {
    // Map camelCase to snake_case for database
    const dbData = {
      date: insertException.date,
      start_time: insertException.startTime,
      end_time: insertException.endTime,
      is_available: insertException.isAvailable ?? false,
      reason: insertException.reason ?? null
    };

    const { data, error } = await supabaseAdmin
      .from('availability_exceptions')
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating availability exception:', error);
      throw new Error('Failed to create availability exception');
    }

    return {
      id: data.id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      isAvailable: data.is_available,
      reason: data.reason,
      createdAt: data.created_at
    };
  }

  async updateAvailabilityException(id: number, insertException: InsertAvailabilityException): Promise<AvailabilityException | undefined> {
    const dbData = {
      date: insertException.date,
      start_time: insertException.startTime,
      end_time: insertException.endTime,
      is_available: insertException.isAvailable ?? false,
      reason: insertException.reason ?? null
    };
    const { data, error } = await supabaseAdmin
      .from('availability_exceptions')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating availability exception:', error);
      return undefined;
    }

    return {
      id: data.id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      isAvailable: data.is_available,
      reason: data.reason,
      createdAt: data.created_at
    };
  }

  async deleteAvailabilityException(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('availability_exceptions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting availability exception:', error);
      return false;
    }

    return true;
  }

  async getAvailabilityExceptionsByDateRange(startDate: string, endDate: string): Promise<AvailabilityException[]> {
    const { data, error } = await supabaseAdmin
      .from('availability_exceptions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
      .order('start_time');

    if (error) {
      console.error('Error fetching availability exceptions by date range:', error);
      return [];
    }

    const mapped = (data || []).map(row => ({
      id: row.id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      isAvailable: row.is_available,
      reason: row.reason,
      createdAt: row.created_at
    }));
    console.debug(`[AVAILABILITY EXCEPTIONS] getAvailabilityExceptionsByDateRange(${startDate}, ${endDate}) -> ${mapped.length} rows`);
    return mapped;
  }

  // Admin methods
  private mapAdminFromDb(data: any): Admin {
    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      createdAt: new Date(data.created_at)
    };
  }

  async getAllAdmins(): Promise<Admin[]> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*');

    if (error) {
      console.error('Error fetching admins:', error);
      return [];
    }

    return (data || []).map(admin => this.mapAdminFromDb(admin));
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching admin:', error);
      return undefined;
    }

    return data ? this.mapAdminFromDb(data) : undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    // Map camelCase to snake_case for database
    const dbAdmin = {
      email: admin.email,
      password_hash: admin.passwordHash
    };

    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert(dbAdmin)
      .select()
      .single();

    if (error) {
      console.error('Error creating admin:', error);
      throw error;
    }

    return this.mapAdminFromDb(data);
  }

  async getAdmin(id: number): Promise<Admin | undefined> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching admin:', error);
      return undefined;
    }

    return data ? this.mapAdminFromDb(data) : undefined;
  }

  // Waiver methods
  async createWaiver(waiver: InsertWaiver): Promise<Waiver> {
    console.log('🔍 Creating waiver with data:', JSON.stringify(waiver, null, 2));

    try {
      // Direct insert (RPC method deprecated since athlete_name/signer_name columns were removed)
      const dbWaiver: any = {
        relationship_to_athlete: waiver.relationshipToAthlete,
        signature: waiver.signature,
        emergency_contact_number: waiver.emergencyContactNumber,
        understands_risks: waiver.understandsRisks,
        agrees_to_policies: waiver.agreesToPolicies,
        authorizes_emergency_care: waiver.authorizesEmergencyCare,
        allows_photo_video: waiver.allowsPhotoVideo,
        confirms_authority: waiver.confirmsAuthority,
        signed_at: waiver.signedAt ? 
          (waiver.signedAt instanceof Date ? waiver.signedAt.toISOString() : new Date(waiver.signedAt as string).toISOString()) : 
          new Date().toISOString()
      };

      // Only add optional fields if they exist
      if (waiver.bookingId) dbWaiver.booking_id = waiver.bookingId;
      if (waiver.athleteId) dbWaiver.athlete_id = waiver.athleteId;
      if (waiver.parentId) dbWaiver.parent_id = waiver.parentId;
      if (waiver.pdfPath) dbWaiver.pdf_path = waiver.pdfPath;
      if (waiver.ipAddress) dbWaiver.ip_address = waiver.ipAddress;
      if (waiver.userAgent) dbWaiver.user_agent = waiver.userAgent;

      console.log('📝 Inserting waiver with fields:', Object.keys(dbWaiver));

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('waivers')
        .insert(dbWaiver)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating waiver:', insertError);
        throw new Error(`Failed to create waiver: ${insertError.message}`);
      }

      const createdWaiver = this.mapWaiverFromDb(insertData);
      console.log('💎 Waiver created successfully with ID:', createdWaiver.id);

      // ✅ AUTOMATICALLY UPDATE ATHLETE'S WAIVER_SIGNED STATUS
      console.log('🚨 CHECKING ATHLETE UPDATE LOGIC - athleteId:', waiver.athleteId);
      if (waiver.athleteId) {
        console.log('🏃‍♂️ Updating athlete waiver_signed status to true for athleteId:', waiver.athleteId);
        try {
          const updateResult = await this.updateAthlete(waiver.athleteId, {
            waiverSigned: true,
            waiverStatus: 'signed',
            latestWaiverId: createdWaiver.id
          });
          console.log('✅ Successfully updated athlete waiver status:', updateResult);
        } catch (updateError) {
          console.error('❌ Error updating athlete waiver status:', updateError);
          // Don't throw here - waiver was created successfully, athlete update is secondary
        }
      } else {
        console.log('⚠️ No athleteId found in waiver data - skipping athlete update');
      }

      return createdWaiver;
    } catch (error) {
      console.error('Error in createWaiver:', error);
      throw new Error('Failed to create waiver');
    }
  }

  private mapWaiverFromDb(data: any): Waiver {
    if (!data) throw new Error('No data returned from waiver creation');

    // Map snake_case back to camelCase for return
    return {
      id: data.id,
      bookingId: data.booking_id,
      athleteId: data.athlete_id,
      parentId: data.parent_id,
      athleteName: data.athlete_name || 'Unknown Athlete',
      signerName: data.signer_name || 'Unknown Signer',
      relationshipToAthlete: data.relationship_to_athlete,
      signature: data.signature,
      emergencyContactNumber: data.emergency_contact_number,
      understandsRisks: data.understands_risks,
      agreesToPolicies: data.agrees_to_policies,
      authorizesEmergencyCare: data.authorizes_emergency_care,
      allowsPhotoVideo: data.allows_photo_video,
      confirmsAuthority: data.confirms_authority,
      pdfPath: data.pdf_path,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      signedAt: new Date(data.signed_at),
      emailSentAt: data.email_sent_at ? new Date(data.email_sent_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  async getWaiver(id: number): Promise<Waiver | undefined> {
    const { data, error } = await supabase
      .from('waivers')
      .select(`
        *,
        athletes!fk_waivers_athlete (
          first_name,
          last_name
        ),
        parents!fk_waivers_parent (
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching waiver:', error);
      return undefined;
    }

    if (!data) return undefined;

    const athlete = data.athletes;
    const parent = data.parents;

    return this.mapWaiverFromDb({
      ...data,
      athlete_name: athlete ? `${athlete.first_name} ${athlete.last_name}` : 'Unknown Athlete',
      signer_name: parent ? `${parent.first_name} ${parent.last_name}` : 'Unknown Signer'
    });
  }

  async getWaiverByAthleteId(athleteId: number): Promise<Waiver | undefined> {
    const { data, error } = await supabase
      .from('waivers')
      .select('*')
      .eq('athlete_id', athleteId)
      .single();

    if (error) {
      console.error('Error fetching waiver by athlete ID:', error);
      return undefined;
    }

    return data;
  }

  async getWaiverByBookingId(bookingId: number): Promise<Waiver | undefined> {
    const { data, error } = await supabase
      .from('waivers')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error) {
      console.error('Error fetching waiver by booking ID:', error);
      return undefined;
    }

    return data;
  }

  async getAllWaivers(): Promise<Waiver[]> {
    const { data, error } = await supabaseAdmin
      .from('waivers')
      .select(`
        *,
        athletes!fk_waivers_athlete (
          first_name,
          last_name
        ),
        parents!fk_waivers_parent (
          first_name,
          last_name
        )
      `)
      .order('signed_at', { ascending: false });

    if (error) {
      console.error('Error fetching waivers:', error);
      throw new Error('Failed to fetch waivers');
    }

    if (!data) return [];

    // Map all waivers from snake_case to camelCase with joined data
    return data.map((waiver: any) => {
      const athlete = waiver.athletes;
      const parent = waiver.parents;
      
      return this.mapWaiverFromDb({
        ...waiver,
        athlete_name: athlete ? `${athlete.first_name} ${athlete.last_name}` : 'Unknown Athlete',
        signer_name: parent ? `${parent.first_name} ${parent.last_name}` : 'Unknown Signer'
      });
    });
  }

  async updateWaiver(id: number, waiver: Partial<InsertWaiver>): Promise<Waiver | undefined> {
    const { data, error } = await supabase
      .from('waivers')
      .update(waiver)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating waiver:', error);
      return undefined;
    }

    return data;
  }

  async updateWaiverPdfPath(id: number, pdfPath: string): Promise<Waiver | undefined> {
    const { data, error } = await supabase
      .from('waivers')
      .update({ pdf_path: pdfPath })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating waiver PDF path:', error);
      return undefined;
    }

    return data;
  }

  async updateWaiverEmailSent(id: number): Promise<Waiver | undefined> {
    const { data, error } = await supabase
      .from('waivers')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating waiver email sent:', error);
      return undefined;
    }

    return data;
  }

  // Parent auth methods
  async getParentById(id: number): Promise<Parent | undefined> {
    const { data, error } = await supabaseAdmin
      .from('parents')
      .select('id, first_name, last_name, email, phone, emergency_contact_name, emergency_contact_phone, created_at, updated_at, password_hash, is_verified, blog_emails')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching parent by ID:', error);
      return undefined;
    }

    // Transform snake_case to camelCase
    return data ? {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      emergencyContactName: data.emergency_contact_name,
      emergencyContactPhone: data.emergency_contact_phone,
      passwordHash: data.password_hash || null,
      isVerified: data.is_verified || false,
      blogEmails: data.blog_emails || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } : undefined;
  }

  async createParentAuthCode(authCode: InsertParentAuthCode): Promise<ParentAuthCode> {
    // Map camelCase to snake_case for Supabase
    const supabaseData = {
      email: authCode.email,
      code: authCode.code,
      expires_at: authCode.expiresAt,
      used: authCode.used || false,
      used_at: null, // usedAt property doesn't exist in schema
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('parent_auth_codes')
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating parent auth code:', error);
      throw new Error('Failed to create parent auth code');
    }

    return data;
  }

  async getParentAuthCode(email: string, code: string): Promise<ParentAuthCode | undefined> {
    const { data, error } = await supabase
      .from('parent_auth_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching parent auth code:', error);
      return undefined;
    }

    return data;
  }

  async deleteParentAuthCode(email: string): Promise<boolean> {
    const { error } = await supabase
      .from('parent_auth_codes')
      .delete()
      .eq('email', email);

    if (error) {
      console.error('Error deleting parent auth code:', error);
      return false;
    }

    return true;
  }

  async markAuthCodeAsUsed(id: number): Promise<void> {
    const { error } = await supabase
      .from('parent_auth_codes')
      .update({ used: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking auth code as used:', error);
    }
  }

  async cleanupExpiredAuthCodes(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { error } = await supabase
      .from('parent_auth_codes')
      .delete()
      .or(`used.eq.true,created_at.lt.${oneHourAgo.toISOString()}`);

    if (error) {
      console.error('Error cleaning up expired auth codes:', error);
    }
  }

  // Slot reservation methods
  async getActiveReservations(date: string): Promise<{ startTime: string; lessonType: string }[]> {
    const { data, error } = await supabase
      .from('slot_reservations')
      .select('start_time, lesson_type')
      .eq('date', date)
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error fetching active reservations:', error);
      return [];
    }

    return (data || []).map(r => ({
      startTime: r.start_time,
      lessonType: r.lesson_type
    }));
  }

  async reserveSlot(date: string, startTime: string, lessonType: string, sessionId: string): Promise<boolean> {
    try {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      const { error } = await supabase
        .from('slot_reservations')
        .insert({
          date,
          start_time: startTime,
          lesson_type: lessonType,
          session_id: sessionId,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Error reserving slot:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error reserving slot:', error);
      return false;
    }
  }

  async releaseSlot(date: string, startTime: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('slot_reservations')
        .delete()
        .eq('date', date)
        .eq('start_time', startTime);

      if (error) {
        console.error('Error releasing slot:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error releasing slot:', error);
      return false;
    }
  }

  async cleanupExpiredReservations(): Promise<void> {
    const { error } = await supabase
      .from('slot_reservations')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up expired reservations:', error);
    }
  }

  // Archived waiver methods
  async getAllArchivedWaivers(): Promise<ArchivedWaiver[]> {
    const { data, error } = await supabase
      .from('archived_waivers')
      .select('*')
      .order('archived_at', { ascending: false });

    if (error) {
      console.error('Error fetching archived waivers:', error);
      return [];
    }

    return data || [];
  }

  async createArchivedWaiver(waiver: InsertArchivedWaiver): Promise<ArchivedWaiver> {
    const { data, error } = await supabase
      .from('archived_waivers')
      .insert({
        original_waiver_id: waiver.originalWaiverId,
        athlete_name: waiver.athleteName,
        signer_name: waiver.signerName,
        relationship_to_athlete: waiver.relationshipToAthlete,
        signature: waiver.signature,
        emergency_contact_number: waiver.emergencyContactNumber,
        understands_risks: waiver.understandsRisks,
        agrees_to_policies: waiver.agreesToPolicies,
        authorizes_emergency_care: waiver.authorizesEmergencyCare,
        allows_photo_video: waiver.allowsPhotoVideo,
        confirms_authority: waiver.confirmsAuthority,
        pdf_path: waiver.pdfPath,
        ip_address: waiver.ipAddress,
        user_agent: waiver.userAgent,
        signed_at: waiver.signedAt,
        email_sent_at: waiver.emailSentAt,
        archived_at: waiver.archivedAt || new Date(),
        archive_reason: waiver.archiveReason,
        legal_retention_period: waiver.legalRetentionPeriod,
        original_parent_id: waiver.originalParentId,
        original_athlete_id: waiver.originalAthleteId
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating archived waiver:', error);
      throw new Error('Failed to create archived waiver');
    }

    return data;
  }

  async deleteArchivedWaiver(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('archived_waivers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting archived waiver:', error);
      return false;
    }

    return true;
  }

  async archiveWaiver(waiverId: number, reason: string): Promise<ArchivedWaiver | undefined> {
    // First get the original waiver
    const originalWaiver = await this.getWaiver(waiverId);
    if (!originalWaiver) {
      return undefined;
    }

    // Get athlete and parent data for names if missing
    let athleteName = originalWaiver.athleteName;
    let signerName = originalWaiver.signerName;
    
    if (!athleteName || !signerName) {
      const [athlete, parent] = await Promise.all([
        this.getAthlete(originalWaiver.athleteId),
        this.getParentById(originalWaiver.parentId)
      ]);
      
      if (!athleteName) {
        athleteName = athlete ? 
          `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() || athlete.name || 'Unknown Athlete' :
          'Unknown Athlete';
      }
      
      if (!signerName) {
        signerName = parent ? 
          `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'Unknown Parent' :
          'Unknown Parent';
      }
    }

    // Create archived waiver
    const archivedWaiver = await this.createArchivedWaiver({
      originalWaiverId: originalWaiver.id,
      athleteName: athleteName || 'Unknown Athlete',
      signerName: signerName,
      relationshipToAthlete: originalWaiver.relationshipToAthlete || 'Parent/Guardian',
      signature: originalWaiver.signature,
      emergencyContactNumber: originalWaiver.emergencyContactNumber,
      understandsRisks: originalWaiver.understandsRisks ?? false,
      agreesToPolicies: originalWaiver.agreesToPolicies ?? false,
      authorizesEmergencyCare: originalWaiver.authorizesEmergencyCare ?? false,
      allowsPhotoVideo: originalWaiver.allowsPhotoVideo ?? true,
      confirmsAuthority: originalWaiver.confirmsAuthority ?? false,
      pdfPath: originalWaiver.pdfPath,
      ipAddress: originalWaiver.ipAddress,
      userAgent: originalWaiver.userAgent,
      signedAt: originalWaiver.signedAt || new Date(),
      emailSentAt: originalWaiver.emailSentAt,
      archivedAt: new Date(),
      archiveReason: reason,
      legalRetentionPeriod: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 years
      originalParentId: originalWaiver.parentId,
      originalAthleteId: originalWaiver.athleteId
    });

    return archivedWaiver;
  }

  // Normalized Lookup Tables Implementation
  async getAllApparatus(): Promise<Apparatus[]> {
    const { data, error } = await supabaseAdmin
      .from('apparatus')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching apparatus:', error);
      return [];
    }

    return data || [];
  }

  async createApparatus(apparatus: InsertApparatus): Promise<Apparatus> {
    const { data, error } = await supabaseAdmin
      .from('apparatus')
      .insert({
        name: apparatus.name,
        sort_order: apparatus.sortOrder || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating apparatus:', error);
      throw new Error('Failed to create apparatus');
    }

    return data;
  }

  async updateApparatus(id: number, apparatus: Partial<InsertApparatus>): Promise<Apparatus | undefined> {
    const { data, error } = await supabase
      .from('apparatus')
      .update({
        name: apparatus.name,
        sort_order: apparatus.sortOrder
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating apparatus:', error);
      return undefined;
    }

    return data;
  }

  async deleteApparatus(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('apparatus')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting apparatus:', error);
      return false;
    }

    return true;
  }

  async getAllFocusAreas(): Promise<FocusArea[]> {
    const { data, error } = await supabaseAdmin
      .from('focus_areas')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching focus areas:', error);
      return [];
    }

    return data || [];
  }

  async getFocusAreasByApparatus(apparatusId: number): Promise<FocusArea[]> {
    const { data, error } = await supabase
      .from('focus_areas')
      .select('*')
      .eq('apparatus_id', apparatusId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching focus areas by apparatus:', error);
      return [];
    }
    
    return data || [];
  }
  
  async getFocusAreasByLevel(level: string): Promise<FocusArea[]> {
    // For 'beginner' level, we only return beginner focus areas
    // For 'intermediate' level, we return beginner and intermediate focus areas
    // For 'advanced' level, we return all focus areas
    let query = supabase.from('focus_areas').select('*');
    
    if (level === 'beginner') {
      query = query.eq('level', 'beginner');
    } else if (level === 'intermediate') {
      query = query.in('level', ['beginner', 'intermediate']);
    }
    // For 'advanced', we return all levels
    
    const { data, error } = await query.order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching focus areas by level:', error);
      return [];
    }
    
    return data || [];

    return data || [];
  }

  async createFocusArea(focusArea: InsertFocusArea): Promise<FocusArea> {
    const { data, error } = await supabase
      .from('focus_areas')
      .insert({
        name: focusArea.name,
        apparatus_id: focusArea.apparatusId,
        level: focusArea.level || 'intermediate',
        sort_order: focusArea.sortOrder || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating focus area:', error);
      throw new Error('Failed to create focus area');
    }

    return data;
  }

  async updateFocusArea(id: number, focusArea: Partial<InsertFocusArea>): Promise<FocusArea | undefined> {
    const { data, error } = await supabase
      .from('focus_areas')
      .update({
        name: focusArea.name,
        apparatus_id: focusArea.apparatusId,
        level: focusArea.level,
        sort_order: focusArea.sortOrder
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating focus area:', error);
      return undefined;
    }

    return data;
  }

  async deleteFocusArea(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('focus_areas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting focus area:', error);
      return false;
    }

    return true;
  }

  async getAllSideQuests(): Promise<SideQuest[]> {
    const { data, error } = await supabaseAdmin
      .from('side_quests')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching side quests:', error);
      return [];
    }

    return data || [];
  }

  async createSideQuest(sideQuest: InsertSideQuest): Promise<SideQuest> {
    const { data, error } = await supabase
      .from('side_quests')
      .insert({
        name: sideQuest.name,
        sort_order: sideQuest.sortOrder || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating side quest:', error);
      throw new Error('Failed to create side quest');
    }

    return data;
  }

  async updateSideQuest(id: number, sideQuest: Partial<InsertSideQuest>): Promise<SideQuest | undefined> {
    const { data, error } = await supabase
      .from('side_quests')
      .update({
        name: sideQuest.name,
        sort_order: sideQuest.sortOrder
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating side quest:', error);
      return undefined;
    }

    return data;
  }

  async deleteSideQuest(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('side_quests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting side quest:', error);
      return false;
    }

    return true;
  }

  async getAllBookingsWithRelations(): Promise<BookingWithRelations[]> {
    this.logQuery('SELECT', 'bookings with relations');
    
    // Get bookings with basic info first
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    if (!bookings || bookings.length === 0) {
      return [];
    }

    // Get related data for all bookings
    const bookingIds = bookings.map(b => b.id);
    const parentIds = Array.from(new Set(bookings.map(b => b.parent_id).filter(Boolean)));
    const lessonTypeIds = Array.from(new Set(bookings.map(b => b.lesson_type_id).filter(Boolean)));

    // Fetch parents
    const { data: parents } = await supabaseAdmin
      .from('parents')
      .select('*')
      .in('id', parentIds);

    // Fetch lesson types  
    const { data: lessonTypes } = await supabaseAdmin
      .from('lesson_types')
      .select('*')
      .in('id', lessonTypeIds);

    // Fetch athletes for bookings
    const { data: bookingAthletes } = await supabaseAdmin
      .from('booking_athletes')
      .select(`
        booking_id, slot_order,
        athletes!inner(
          id, first_name, last_name, date_of_birth, 
          gender, allergies, experience, photo
        )
      `)
      .in('booking_id', bookingIds);

    // Fetch focus areas for bookings
    const { data: bookingFocusAreas } = await supabaseAdmin
      .from('booking_focus_areas')
      .select(`
        booking_id,
        focus_areas!inner(id, name)
      `)
      .in('booking_id', bookingIds);

    // Create lookup maps
    const parentMap = new Map(parents?.map(p => [p.id, p]) || []);
    const lessonTypeMap = new Map(lessonTypes?.map(lt => [lt.id, lt]) || []);
    const athletesByBooking = new Map<number, any[]>();
    const focusAreasByBooking = new Map<number, string[]>();
    
    bookingAthletes?.forEach((ba: any) => {
      if (!athletesByBooking.has(ba.booking_id)) {
        athletesByBooking.set(ba.booking_id, []);
      }
      // Fix: Access the nested athletes object correctly - ba.athletes is the joined object
      const athlete = ba.athletes as any; // Force type to any to avoid TypeScript inference issues
      if (athlete) {
        athletesByBooking.get(ba.booking_id)!.push({
          athleteId: athlete.id,
          slotOrder: ba.slot_order,
          name: `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim(),
          dateOfBirth: athlete.date_of_birth || '',
          allergies: athlete.allergies || '',
          experience: athlete.experience || 'beginner',
          photo: athlete.photo || ''
        });
      }
    });

    // Map focus areas to bookings
    bookingFocusAreas?.forEach((bfa: any) => {
      if (!focusAreasByBooking.has(bfa.booking_id)) {
        focusAreasByBooking.set(bfa.booking_id, []);
      }
      const focusArea = bfa.focus_areas as any;
      if (focusArea) {
        focusAreasByBooking.get(bfa.booking_id)!.push(focusArea.name);
      }
    });

    return bookings.map((booking: any) => {
      const parent = parentMap.get(booking.parent_id);
      const lessonType = lessonTypeMap.get(booking.lesson_type_id);
      const athletes = athletesByBooking.get(booking.id) || [];
      const focusAreas = focusAreasByBooking.get(booking.id) || [];
      // Sort athletes by slot order
      athletes.sort((a, b) => a.slotOrder - b.slotOrder);
      return {
        id: booking.id,
        parentId: booking.parent_id,
        athleteId: booking.athlete_id,
        lessonTypeId: booking.lesson_type_id,
        waiverId: booking.waiver_id,
        preferredDate: booking.preferred_date,
        preferredTime: booking.preferred_time,
        status: booking.status,
        paymentStatus: booking.payment_status,
        attendanceStatus: booking.attendance_status,
        bookingMethod: booking.booking_method,
        amount: booking.amount || (lessonType?.total_price?.toString() ?? lessonType?.price?.toString()) || "0",
        reservationFeePaid: booking.reservation_fee_paid,
        paidAmount: booking.paid_amount,
        specialRequests: booking.special_requests,
        adminNotes: booking.admin_notes,
        progressNote: booking.progress_note || null,
        coachName: booking.coach_name || "Coach Will",
        
        // Safety verification fields
        dropoffPersonName: booking.dropoff_person_name,
        dropoffPersonRelationship: booking.dropoff_person_relationship,
        dropoffPersonPhone: booking.dropoff_person_phone,
        pickupPersonName: booking.pickup_person_name,
        pickupPersonRelationship: booking.pickup_person_relationship,
        pickupPersonPhone: booking.pickup_person_phone,
        altPickupPersonName: booking.alt_pickup_person_name,
        altPickupPersonRelationship: booking.alt_pickup_person_relationship,
        altPickupPersonPhone: booking.alt_pickup_person_phone,
        safetyVerificationSigned: booking.safety_verification_signed,
        safetyVerificationSignedAt: booking.safety_verification_signed_at,
        
        stripeSessionId: booking.stripe_session_id,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
        
        // Related entities
        parent: parent ? {
          id: parent.id,
          firstName: parent.first_name,
          lastName: parent.last_name,
          email: parent.email,
          phone: parent.phone,
          emergencyContactName: parent.emergency_contact_name,
          emergencyContactPhone: parent.emergency_contact_phone,
          createdAt: parent.created_at,
          updatedAt: parent.updated_at,
        } : undefined,
        
        lessonType: lessonType ? {
          id: lessonType.id,
          name: lessonType.name,
          duration: lessonType.duration,
          price: lessonType.price,
          total_price: lessonType.total_price,
          reservation_fee: lessonType.reservation_fee,
          description: lessonType.description,
        } : undefined,
        
        // Legacy athlete fields for compatibility
        
        // Legacy compatibility fields
        parentFirstName: parent?.first_name,
        parentLastName: parent?.last_name,
        parentEmail: parent?.email,
        parentPhone: parent?.phone,
        emergencyContactName: parent?.emergency_contact_name,
        emergencyContactPhone: parent?.emergency_contact_phone,
        lessonTypeName: lessonType?.name,
        
        // Legacy athlete fields for backward compatibility
        athlete1Name: athletes[0] ? athletes[0].name : null,
        athlete1DateOfBirth: athletes[0]?.dateOfBirth,
        athlete1Allergies: athletes[0]?.allergies,
        athlete1Experience: athletes[0]?.experience,
        athlete2Name: athletes[1] ? athletes[1].name : null,
        athlete2DateOfBirth: athletes[1]?.dateOfBirth,
        athlete2Allergies: athletes[1]?.allergies,
        athlete2Experience: athletes[1]?.experience,
        
        // Add the athletes array with the correct structure
        athletes: athletes,
        
        // Empty arrays for relations not yet implemented
        apparatus: [],
        focusAreas: focusAreas,
        focusAreaOther: booking.focus_area_other || null,
        sideQuests: [],
        
        // Legacy waiver fields (set to defaults since waivers are separate now)
        waiverSigned: false,
        waiverSignedAt: null,
        waiverSignatureName: undefined,
      } as BookingWithRelations;
    });
  }

  async getBookingWithRelations(id: number): Promise<BookingWithRelations | undefined> {
    this.logQuery('SELECT', 'booking with relations', { id });
    
    const booking = await this.getBooking(id);
    if (!booking) return undefined;
    
    // Get parent data
    let parent = undefined;
    if (booking.parentId) {
      parent = await this.getParentById(booking.parentId);
    }

    // Get lesson type data
    let lessonType = undefined;
    if (booking.lessonTypeId) {
      const { data } = await supabase
        .from('lesson_types')
        .select('*')
        .eq('id', booking.lessonTypeId)
        .single();
      if (data) {
        lessonType = {
          id: data.id,
          name: data.name,
          duration: data.duration_minutes,
          price: parseFloat(data.total_price || '0'),
          description: data.description,
          key: data.name.toLowerCase().replace(/\s+/g, '-') // Add slug/key for the lessonType
        };
      }
      
      // Set the booking amount if it's not already set
      booking.amount = booking.amount ?? lessonType?.price?.toString() ?? '0';
    }

    // Get waiver data
    let waiver = undefined;
    if (booking.waiverId) {
      waiver = await this.getWaiver(booking.waiverId);
    }

    // Get related apparatus
    const { data: apparatusData } = await supabaseAdmin
      .from('booking_apparatus')
      .select(`
        apparatus_id,
        apparatus!inner(id, name)
      `)
      .eq('booking_id', id);

    // Get related focus areas
    const { data: focusAreasData } = await supabaseAdmin
      .from('booking_focus_areas')
      .select(`
        focus_area_id,
        focus_areas!inner(id, name)
      `)
      .eq('booking_id', id);

    // Get related side quests
    const { data: sideQuestsData } = await supabaseAdmin
      .from('booking_side_quests')
      .select(`
        side_quest_id,
        side_quests!inner(id, name)
      `)
      .eq('booking_id', id);

    // Get related athletes
    const { data: athletesData } = await supabaseAdmin
      .from('booking_athletes')
      .select(`
        athlete_id,
        slot_order,
        athletes!inner(
          id, 
          first_name, 
          last_name, 
          date_of_birth, 
          gender, 
          allergies, 
          experience, 
          parent_id,
          waiver_status,
          latest_waiver_id,
          waiver_signed
        )
      `)
      .eq('booking_id', id)
      .order('slot_order', { ascending: true });

    // Prepare the complete booking data with all relations
    const bookingWithRelations = {
      ...booking,
      parent,
      lessonType,
      waiver,
      apparatus: apparatusData?.map(item => ({ id: (item.apparatus as any).id, name: (item.apparatus as any).name })) || [],
      focusAreas: focusAreasData?.map(item => (item.focus_areas as any).name) || [],
      sideQuests: sideQuestsData?.map(item => ({ id: (item.side_quests as any).id, name: (item.side_quests as any).name })) || [],
      athletes: athletesData?.map(item => {
        const athlete = item.athletes as any;
        return {
          id: athlete.id,
          name: `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim(),
          firstName: athlete.first_name || '',
          lastName: athlete.last_name || '',
          parentId: athlete.parent_id || null,
          createdAt: athlete.created_at || null,
          updatedAt: athlete.updated_at || null,
          gender: athlete.gender || null,
          latestWaiverId: athlete.latest_waiver_id || null,
          waiverSigned: athlete.waiver_signed || false,
          waiverStatus: athlete.waiver_status || 'pending',
          allergies: athlete.allergies || '',
          experience: athlete.experience || 'beginner',
          dateOfBirth: athlete.date_of_birth || null,
          photo: athlete.photo || '',
          // Add additional fields for UI consumption
          athleteId: athlete.id, // Include athleteId for easier access
          slotOrder: item.slot_order || 1 // Get slot_order from booking_athletes
        };
      }) || []
    } as BookingWithRelations;

    console.log("Returning booking with relations:", {
      id: bookingWithRelations.id,
      hasLessonType: !!bookingWithRelations.lessonType,
      hasParent: !!bookingWithRelations.parent,
      athleteCount: bookingWithRelations.athletes?.length || 0,
      focusAreaCount: bookingWithRelations.focusAreas?.length || 0
    });

    return bookingWithRelations;
  }

  async createBookingWithRelations(
    booking: InsertBooking,
    apparatusIds: number[],
    focusAreaIds: number[],
    sideQuestIds: number[]
  ): Promise<BookingWithRelations> {
    this.logQuery('INSERT', 'booking with relations');
    
    const createdBooking = await this.createBooking(booking);
    
    // Create apparatus relationships
    if (apparatusIds.length > 0) {
      const apparatusRelations = apparatusIds.map(apparatusId => ({
        booking_id: createdBooking.id,
        apparatus_id: apparatusId
      }));
      
      await supabase
        .from('booking_apparatus')
        .insert(apparatusRelations);
    }
    
    // Create focus area relationships
    if (focusAreaIds.length > 0) {
      const focusAreaRelations = focusAreaIds.map(focusAreaId => ({
        booking_id: createdBooking.id,
        focus_area_id: focusAreaId
      }));
      
      await supabase
        .from('booking_focus_areas')
        .insert(focusAreaRelations);
    }
    
    // Create side quest relationships
    if (sideQuestIds.length > 0) {
      const sideQuestRelations = sideQuestIds.map(sideQuestId => ({
        booking_id: createdBooking.id,
        side_quest_id: sideQuestId
      }));
      
      await supabase
        .from('booking_side_quests')
        .insert(sideQuestRelations);
    }
    
    // Return the booking with all relations loaded
    const bookingWithRelations = await this.getBookingWithRelations(createdBooking.id);
    return bookingWithRelations!;
  }

  async updateBookingRelations(
    bookingId: number,
    apparatusIds: number[],
    focusAreaIds: number[],
    sideQuestIds: number[]
  ): Promise<BookingWithRelations | undefined> {
    this.logQuery('UPDATE', 'booking relations', { bookingId });
    
    const booking = await this.getBooking(bookingId);
    if (!booking) return undefined;
    
    // Delete existing apparatus relationships
    await supabase
      .from('booking_apparatus')
      .delete()
      .eq('booking_id', bookingId);
    
    // Delete existing focus area relationships
    await supabase
      .from('booking_focus_areas')
      .delete()
      .eq('booking_id', bookingId);
    
    // Delete existing side quest relationships
    await supabase
      .from('booking_side_quests')
      .delete()
      .eq('booking_id', bookingId);
    
    // Create new apparatus relationships
    if (apparatusIds.length > 0) {
      const apparatusRelations = apparatusIds.map(apparatusId => ({
        booking_id: bookingId,
        apparatus_id: apparatusId
      }));
      
      await supabase
        .from('booking_apparatus')
        .insert(apparatusRelations);
    }
    
    // Create new focus area relationships
    if (focusAreaIds.length > 0) {
      const focusAreaRelations = focusAreaIds.map(focusAreaId => ({
        booking_id: bookingId,
        focus_area_id: focusAreaId
      }));
      
      await supabase
        .from('booking_focus_areas')
        .insert(focusAreaRelations);
    }
    
    // Create new side quest relationships
    if (sideQuestIds.length > 0) {
      const sideQuestRelations = sideQuestIds.map(sideQuestId => ({
        booking_id: bookingId,
        side_quest_id: sideQuestId
      }));
      
      await supabase
        .from('booking_side_quests')
        .insert(sideQuestRelations);
    }
    
    // Return the booking with all relations loaded
    return await this.getBookingWithRelations(bookingId);
  }

  // Email verification methods
  async createVerificationToken(token: { parentId: number; token: string; expiresAt: Date }): Promise<any> {
    const supabaseData = {
      parent_id: token.parentId,
      token: token.token,
      expires_at: token.expiresAt.toISOString(),
    };

    const { data, error } = await supabaseServiceRole
      .from('parent_verification_tokens')
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating verification token:', error);
      throw error;
    }

    return data;
  }

  async getVerificationToken(token: string): Promise<any> {
    const { data, error } = await supabaseServiceRole
      .from('parent_verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      console.error('Error fetching verification token:', error);
      return undefined;
    }

    return data;
  }

  async markParentAsVerified(parentId: number): Promise<void> {
    const { error } = await supabaseServiceRole
      .from('parents')
      .update({ is_verified: true })
      .eq('id', parentId);

    if (error) {
      console.error('Error marking parent as verified:', error);
      throw error;
    }
  }

  async deleteVerificationToken(token: string): Promise<void> {
    const { error } = await supabaseServiceRole
      .from('parent_verification_tokens')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('Error deleting verification token:', error);
      throw error;
    }
  }

  async deleteVerificationTokensByParentId(parentId: number): Promise<void> {
    const { error } = await supabaseServiceRole
      .from('parent_verification_tokens')
      .delete()
      .eq('parent_id', parentId);

    if (error) {
      console.error('Error deleting verification tokens by parent ID:', error);
      throw error;
    }
  }

  // Password Reset methods
  async createPasswordResetToken(token: { parentId: number; token: string; expiresAt: Date }): Promise<any> {
    const supabaseData = {
      parent_id: token.parentId,
      token: token.token,
      expires_at: token.expiresAt.toISOString(),
      used: false
    };

    const { data, error } = await supabaseServiceRole
      .from('parent_password_reset_tokens')
      .insert(supabaseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating password reset token:', error);
      throw error;
    }

    return data;
  }

  async getPasswordResetToken(token: string): Promise<any> {
    const { data, error } = await supabaseServiceRole
      .from('parent_password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error) {
      console.error('Error fetching password reset token:', error);
      return undefined;
    }

    return data;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    const { error } = await supabaseServiceRole
      .from('parent_password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    if (error) {
      console.error('Error marking password reset token as used:', error);
      throw error;
    }
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    const { error } = await supabaseServiceRole
      .from('parent_password_reset_tokens')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('Error deleting password reset token:', error);
      throw error;
    }
  }

  async deletePasswordResetTokensByParentId(parentId: number): Promise<void> {
    const { error } = await supabaseServiceRole
      .from('parent_password_reset_tokens')
      .delete()
      .eq('parent_id', parentId);

    if (error) {
      console.error('Error deleting password reset tokens by parent ID:', error);
      throw error;
    }
  }

  // Blog Email Subscriptions
  async updateParentBlogEmailOptIn(parentId: number, optIn: boolean): Promise<Parent | undefined> {
    const { data, error } = await supabaseAdmin
      .from('parents')
      .update({ blog_emails: optIn, updated_at: new Date().toISOString() })
      .eq('id', parentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating parent blog email opt-in:', error);
      throw error;
    }

    return data ? {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      passwordHash: data.password_hash,
      phone: data.phone,
      emergencyContactName: data.emergency_contact_name,
      emergencyContactPhone: data.emergency_contact_phone,
      isVerified: data.is_verified,
      blogEmails: data.blog_emails,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    } : undefined;
  }

  async createBlogEmailSignup(email: string): Promise<BlogEmailSignup> {
    const { data, error } = await supabaseAdmin
      .from('blog_email_signups')
      .insert({ email })
      .select()
      .single();

    if (error) {
      console.error('Error creating blog email signup:', error);
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      createdAt: new Date(data.created_at),
    };
  }

  async getAllBlogEmailSignups(): Promise<BlogEmailSignup[]> {
    const { data, error } = await supabaseAdmin
      .from('blog_email_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog email signups:', error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      email: item.email,
      createdAt: new Date(item.created_at),
    }));
  }

  async getAllParentsWithBlogOptIn(): Promise<Parent[]> {
    const { data, error } = await supabaseAdmin
      .from('parents')
      .select('*')
      .eq('blog_emails', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching parents with blog opt-in:', error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      email: item.email,
      passwordHash: item.password_hash,
      phone: item.phone,
      emergencyContactName: item.emergency_contact_name,
      emergencyContactPhone: item.emergency_contact_phone,
      isVerified: item.is_verified,
      blogEmails: item.blog_emails,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
  }

  async getAllBlogEmailAddresses(): Promise<string[]> {
    // Get parent emails with blog opt-in
    const { data: parentData, error: parentError } = await supabaseAdmin
      .from('parents')
      .select('email')
      .eq('blog_emails', true);

    if (parentError) {
      console.error('Error fetching parent emails:', parentError);
      throw parentError;
    }

    // Get guest signup emails
    const { data: signupData, error: signupError } = await supabaseAdmin
      .from('blog_email_signups')
      .select('email');

    if (signupError) {
      console.error('Error fetching signup emails:', signupError);
      throw signupError;
    }

    // Combine and deduplicate emails
    const parentEmails = parentData.map(p => p.email);
    const signupEmails = signupData.map(s => s.email);
    const allEmails = [...parentEmails, ...signupEmails];
    
    return Array.from(new Set(allEmails)); // Remove duplicates
  }

  // Add an athlete to a booking with a specific slot order
  async addAthleteSlot(bookingId: number, athleteId: number, slotOrder: number): Promise<void> {
    console.log(`[STORAGE] Attempting to add athlete ${athleteId} to booking ${bookingId} with slot order ${slotOrder}`);
    
    try {
      // Check if this combination already exists
      const { data: existing } = await supabaseAdmin
        .from('booking_athletes')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('athlete_id', athleteId);

      if (existing && existing.length > 0) {
        console.log(`[STORAGE] Athlete ${athleteId} is already linked to booking ${bookingId}`);
        return; // Already exists, no need to insert
      }

      // Before inserting, let's get detailed database schema information
      console.log(`[STORAGE] DETAILED DATABASE INFO - Before insert operation`);
      try {
        const { data: tableDetails, error: tableError } = await supabaseAdmin
          .from('pg_tables')
          .select('*')
          .eq('tablename', 'booking_athletes');
        
        if (tableError) {
          console.error(`[STORAGE] Error getting table details:`, tableError);
        } else {
          console.log(`[STORAGE] booking_athletes table details:`, tableDetails);
        }
      } catch (e) {
        console.log(`[STORAGE] Could not get table details:`, e);
      }

      console.log(`[STORAGE] Trying insert operation now...`);
      const { error } = await supabaseAdmin
        .from('booking_athletes')
        .insert({
          booking_id: bookingId,
          athlete_id: athleteId,
          slot_order: slotOrder
        });

      if (error) {
        console.error(`[STORAGE] Error adding athlete ${athleteId} to booking ${bookingId}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Try directly with the JavaScript client
        console.log(`[STORAGE] Attempting alternative insert approach...`);
        try {
          await supabaseAdmin.from('booking_athletes').insert([
            { booking_id: bookingId, athlete_id: athleteId, slot_order: slotOrder }
          ]);
          console.log(`[STORAGE] Alternative insert approach succeeded`);
        } catch (altError) {
          console.error(`[STORAGE] Alternative insert approach also failed:`, altError);
          throw new Error(`Failed to link athlete ${athleteId} to booking ${bookingId}: ${error.message}`);
        }
      }

      console.log(`[STORAGE] Successfully added athlete ${athleteId} to booking ${bookingId}`);
    } catch (error) {
      console.error(`[STORAGE] Exception in addAthleteSlot:`, error);
      throw error;
    }
  }

  // Add focus areas to a booking
  async addBookingFocusArea(bookingId: number, focusAreaId: number | number[]): Promise<void> {
    const focusAreaIds = Array.isArray(focusAreaId) ? focusAreaId : [focusAreaId];
    
    const focusAreaInserts = focusAreaIds.map((id: number) => ({
      booking_id: bookingId,
      focus_area_id: id
    }));
    
    const { error } = await supabaseAdmin
      .from('booking_focus_areas')
      .insert(focusAreaInserts);

    if (error) {
      console.error('Error adding focus areas to booking:', error);
      throw error;
    }
  }

  /**
   * Synchronizes booking payment status with Stripe
   * @param stripeClient - Initialized Stripe client instance
   * @param logger - Logger instance for recording results
   * @returns Object containing count of updated bookings and total processed
   */
  async syncPaymentStatus(stripeClient: Stripe, logger: { admin: (message: string) => void }): Promise<{ updatedCount: number, totalCount: number }> {
    // Get all bookings with stripe session IDs that are in "pending" or "reservation-paid" status
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .not('stripe_session_id', 'is', null)
      .in('payment_status', [
        PaymentStatusEnum.RESERVATION_PENDING,
        PaymentStatusEnum.RESERVATION_PAID,
      ]);

    if (error) {
      console.error('Error fetching bookings for payment sync:', error);
      throw error;
    }

    let updatedCount = 0;
    const totalCount = bookings.length;

    logger.admin(`Starting payment sync for ${totalCount} bookings with Stripe sessions`);

    for (const booking of bookings) {
      try {
        // Skip if no stripe session ID
        if (!booking.stripe_session_id) continue;

        // Retrieve the session from Stripe
        const session = await stripeClient.checkout.sessions.retrieve(booking.stripe_session_id);
        
        // Determine new payment and booking status based on Stripe session
        let newPaymentStatus = booking.payment_status;
        let newStatus = booking.status;
        
        switch (session.status) {
          case 'complete':
            // If session is paid, update booking status
            if (session.payment_status === 'paid') {
              newPaymentStatus = PaymentStatusEnum.SESSION_PAID;
              newStatus = BookingStatusEnum.CONFIRMED;
            } else if (session.payment_status === 'no_payment_required') {
              // Handle case where no payment was required
              newPaymentStatus = PaymentStatusEnum.SESSION_PAID;
              newStatus = BookingStatusEnum.CONFIRMED;
            }
            break;
          case 'expired':
            // If session expired and still in unpaid or pending reservation, mark as failed
            if (booking.payment_status === PaymentStatusEnum.UNPAID || 
                booking.payment_status === PaymentStatusEnum.RESERVATION_PENDING) {
              newPaymentStatus = PaymentStatusEnum.RESERVATION_FAILED;
              newStatus = BookingStatusEnum.CANCELLED;
            }
            break;
          default:
            // Default case for pending sessions
            newPaymentStatus = PaymentStatusEnum.RESERVATION_PAID;
            newStatus = BookingStatusEnum.PENDING;
        }

        // Update booking if status changed
        if (newPaymentStatus !== booking.payment_status || newStatus !== booking.status) {
          const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update({
              payment_status: newPaymentStatus,
              status: newStatus
            })
            .eq('id', booking.id);

          if (updateError) {
            console.error(`Error updating booking ${booking.id}:`, updateError);
            continue;
          }

          updatedCount++;
          logger.admin(`Updated booking ${booking.id}: ${booking.payment_status} → ${newPaymentStatus}`);
        }
      } catch (stripeError) {
        console.warn(`Failed to check Stripe session ${booking.stripe_session_id}:`, stripeError);
      }
    }

    logger.admin(`✅ Synced ${updatedCount} bookings with Stripe`);
    return { updatedCount, totalCount };
  }

  // Site Content Management Methods
  async getSiteContent(): Promise<any> {
    try {
      // Get site content (there should only be one row)
      const { data: siteContentData, error: siteError } = await supabaseAdmin
        .from('site_content')
        .select('*')
        .single();

      if (siteError && siteError.code !== 'PGRST116') { // Not found is OK
        console.error('Error fetching site content:', siteError);
      }

      // Get all testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabaseAdmin
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (testimonialsError) {
        console.error('Error fetching testimonials:', testimonialsError);
      }

      // Get all FAQs
      const { data: faqsData, error: faqsError } = await supabaseAdmin
        .from('site_faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (faqsError) {
        console.error('Error fetching FAQs:', faqsError);
      }

      // Return structured content
      return {
        bannerVideo: siteContentData?.banner_video || '',
        heroImages: siteContentData?.hero_images || [],
        equipmentImages: siteContentData?.equipment_images || [
          "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
        ],
        about: siteContentData?.about || {
          bio: 'Coach Will brings nearly 10 years of passionate gymnastics instruction to every lesson.',
          experience: 'Nearly 10 years of coaching experience with athletes of all levels',
          certifications: [
            { title: 'USA Gymnastics Certified', body: 'Official certification from USA Gymnastics' },
            { title: 'CPR/First Aid Certified', body: 'Current safety and emergency response training' },
            { title: 'Background Checked', body: 'Comprehensive background verification completed' }
          ]
        },
        contact: siteContentData?.contact || {
          phone: '(585) 755-8122',
          email: 'Admin@coachwilltumbles.com',
          address: {
            name: 'Oceanside Gymnastics',
            street: '1935 Ave. del Oro #A',
            city: 'Oceanside',
            state: 'CA',
            zip: '92056'
          }
        },
        hours: siteContentData?.hours || {
          monday: { available: true, start: '9:00 AM', end: '4:00 PM' },
          tuesday: { available: true, start: '9:00 AM', end: '3:30 PM' },
          wednesday: { available: true, start: '9:00 AM', end: '4:00 PM' },
          thursday: { available: true, start: '9:00 AM', end: '3:30 PM' },
          friday: { available: true, start: '9:00 AM', end: '4:00 PM' },
          saturday: { available: true, start: '10:00 AM', end: '2:00 PM' },
          sunday: { available: false, start: '', end: '' }
        },
        testimonials: testimonialsData || [],
        faqs: faqsData || []
      };
    } catch (error) {
      console.error('Error in getSiteContent:', error);
      // Return default content if database fails
      return {
        bannerVideo: '',
        heroImages: [],
        equipmentImages: [
          "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
        ],
        about: {
          bio: 'Coach Will brings nearly 10 years of passionate gymnastics instruction to every lesson.',
          experience: 'Nearly 10 years of coaching experience with athletes of all levels',
          certifications: [
            { title: 'USA Gymnastics Certified', body: 'Official certification from USA Gymnastics' },
            { title: 'CPR/First Aid Certified', body: 'Current safety and emergency response training' },
            { title: 'Background Checked', body: 'Comprehensive background verification completed' }
          ]
        },
        contact: {
          phone: '(585) 755-8122',
          email: 'Admin@coachwilltumbles.com',
          address: {
            name: 'Oceanside Gymnastics',
            street: '1935 Ave. del Oro #A',
            city: 'Oceanside',
            state: 'CA',
            zip: '92056'
          }
        },
        hours: {
          monday: { available: true, start: '9:00 AM', end: '4:00 PM' },
          tuesday: { available: true, start: '9:00 AM', end: '3:30 PM' },
          wednesday: { available: true, start: '9:00 AM', end: '4:00 PM' },
          thursday: { available: true, start: '9:00 AM', end: '3:30 PM' },
          friday: { available: true, start: '9:00 AM', end: '4:00 PM' },
          saturday: { available: true, start: '10:00 AM', end: '2:00 PM' },
          sunday: { available: false, start: '', end: '' }
        },
        testimonials: [],
        faqs: []
      };
    }
  }

  async updateSiteContent(content: any): Promise<any> {
    try {
      const updateData: any = {};
      
      if (content.bannerVideo !== undefined) updateData.banner_video = content.bannerVideo;
      if (content.heroImages !== undefined) updateData.hero_images = content.heroImages;
      if (content.equipmentImages !== undefined) updateData.equipment_images = content.equipmentImages;
      if (content.about !== undefined) updateData.about = content.about;
      if (content.contact !== undefined) updateData.contact = content.contact;
      if (content.hours !== undefined) updateData.hours = content.hours;
      
      updateData.updated_at = new Date().toISOString();

      // Upsert the site content (there should only be one row with id=1)
      const { data, error } = await supabaseAdmin
        .from('site_content')
        .upsert({ id: 1, ...updateData }, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating site content:', error);
        throw new Error(`Failed to update site content: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateSiteContent:', error);
      throw error;
    }
  }

  async getAllTestimonials(): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }

    return data || [];
  }

  async createTestimonial(testimonial: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .insert({
        name: testimonial.name,
        text: testimonial.text,
        rating: testimonial.rating || 5,
        featured: testimonial.featured || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating testimonial:', error);
      throw new Error(`Failed to create testimonial: ${error.message}`);
    }

    return data;
  }

  async updateTestimonial(id: number, testimonial: any): Promise<any> {
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (testimonial.name !== undefined) updateData.name = testimonial.name;
    if (testimonial.text !== undefined) updateData.text = testimonial.text;
    if (testimonial.rating !== undefined) updateData.rating = testimonial.rating;
    if (testimonial.featured !== undefined) updateData.featured = testimonial.featured;

    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating testimonial:', error);
      throw new Error(`Failed to update testimonial: ${error.message}`);
    }

    return data;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
      return false;
    }

    return true;
  }

  async setFeaturedTestimonial(id: number): Promise<any> {
    // The database trigger will automatically unset other featured testimonials
    const { data, error } = await supabaseAdmin
      .from('testimonials')
      .update({ featured: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error setting featured testimonial:', error);
      throw new Error(`Failed to set featured testimonial: ${error.message}`);
    }

    return data;
  }

  async getAllSiteFaqs(): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('site_faqs')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }

    return data || [];
  }

  async createSiteFaq(faq: any): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('site_faqs')
      .insert({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'General',
        display_order: faq.displayOrder || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating FAQ:', error);
      throw new Error(`Failed to create FAQ: ${error.message}`);
    }

    return data;
  }

  async updateSiteFaq(id: number, faq: any): Promise<any> {
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (faq.question !== undefined) updateData.question = faq.question;
    if (faq.answer !== undefined) updateData.answer = faq.answer;
    if (faq.category !== undefined) updateData.category = faq.category;
    if (faq.displayOrder !== undefined) updateData.display_order = faq.displayOrder;

    const { data, error } = await supabaseAdmin
      .from('site_faqs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating FAQ:', error);
      throw new Error(`Failed to update FAQ: ${error.message}`);
    }

    return data;
  }

  async deleteSiteFaq(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('site_faqs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting FAQ:', error);
      return false;
    }

    return true;
  }

  async bulkUpsertSiteFaqs(faqs: any[]): Promise<any[]> {
    try {
      // First, delete all existing FAQs to do a complete replacement
      const { error: deleteError } = await supabaseAdmin
        .from('site_faqs')
        .delete()
        .neq('id', 0); // Delete all rows

      if (deleteError) {
        console.error('Error deleting existing FAQs:', deleteError);
        throw new Error(`Failed to delete existing FAQs: ${deleteError.message}`);
      }

      // Insert all new FAQs
      const insertData = faqs.map((faq, index) => ({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'General',
        display_order: index
      }));

      const { data, error } = await supabaseAdmin
        .from('site_faqs')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Error bulk inserting FAQs:', error);
        throw new Error(`Failed to bulk insert FAQs: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in bulkUpsertSiteFaqs:', error);
      throw error;
    }
  }
}

export const storage = new SupabaseStorage();