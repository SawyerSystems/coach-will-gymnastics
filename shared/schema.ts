import { relations } from "drizzle-orm";
import { boolean, date, decimal, integer, json, pgEnum, pgTable, serial, text, time, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define PostgreSQL enum types for booking statuses
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "paid", 
  "confirmed", 
  "completed", 
  "failed", 
  "cancelled"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "reservation-pending",
  "reservation-paid",
  "reservation-failed",
  "session-paid",
  "reservation-refunded",
  "session-refunded"
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "pending", 
  "confirmed", 
  "completed", 
  "cancelled", 
  "no-show", 
  "manual"
]);

// Create TypeScript enums from the PostgreSQL enums for type safety
export enum BookingStatusEnum {
  PENDING = "pending",
  PAID = "paid", 
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled"
  
  // Legacy values - preserved in TypeScript for backward compatibility
  // but no longer used in new code or stored in the database
  // MANUAL = "manual",
  // MANUAL_PAID = "manual-paid",
  // NO_SHOW = "no-show", 
  // RESERVATION_PENDING = "reservation-pending",
  // RESERVATION_PAID = "reservation-paid",
  // RESERVATION_FAILED = "reservation-failed"
}

export enum PaymentStatusEnum {
  UNPAID = "unpaid",
  RESERVATION_PENDING = "reservation-pending",
  RESERVATION_PAID = "reservation-paid",
  RESERVATION_FAILED = "reservation-failed",
  SESSION_PAID = "session-paid",
  RESERVATION_REFUNDED = "reservation-refunded",
  SESSION_REFUNDED = "session-refunded"
}

export enum AttendanceStatusEnum {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no-show",
  MANUAL = "manual"
}

// TypeScript enum for booking methods
export enum BookingMethodEnum {
  WEBSITE = "Website",
  ADMIN = "Admin", 
  TEXT = "Text",
  CALL = "Call",
  IN_PERSON = "In-Person",
  EMAIL = "Email"
}


export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // new column
  phone: text("phone").notNull(),
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogEmailSignups = pgTable("blog_email_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentVerificationTokens = pgTable("parent_verification_tokens", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => parents.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const parentPasswordResetTokens = pgTable("parent_password_reset_tokens", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => parents.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const athletes = pgTable('athletes', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id').references(() => parents.id), // Can be NULL in actual DB
  name: text('name'), // Can be NULL in actual DB
  firstName: text('first_name'), // Can be NULL in actual DB  
  lastName: text('last_name'), // Can be NULL in actual DB
  allergies: text('allergies'),
  experience: text('experience').notNull(),
  photo: text('photo'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  dateOfBirth: date('date_of_birth'),
  gender: text('gender'), // References genders table, but can be any text
  // Gym payout membership flag
  isGymMember: boolean('is_gym_member').notNull().default(false),
  latestWaiverId: integer('latest_waiver_id').references((): any => waivers.id, { onDelete: 'set null' }),
  waiverStatus: varchar('waiver_status').default('pending'), // varchar in actual DB
  waiverSigned: boolean('waiver_signed').default(false).notNull(), // Simple boolean for waiver status
});

// Lesson types table
export const lessonTypes = pgTable("lesson_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  reservationFee: decimal("reservation_fee", { precision: 10, scale: 2 }).notNull(),
});

// Booking method enum for the new dropdown requirements
export const bookingMethodEnum = pgEnum("booking_method", [
  "Website", "Admin", "Text", "Call", "In-Person", "Email"
]);

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => parents.id),
  lessonTypeId: integer("lesson_type_id").references(() => lessonTypes.id),
  waiverId: integer("waiver_id"),
  preferredDate: date("preferred_date"),
  preferredTime: time("preferred_time"),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  attendanceStatus: text("attendance_status").notNull().default("pending"),
  bookingMethod: text("booking_method").notNull().default("Website"),
  reservationFeePaid: boolean("reservation_fee_paid").notNull().default(false),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  stripeSessionId: text("stripe_session_id"),
  // Idempotent session confirmation email tracking
  sessionConfirmationEmailSent: boolean("session_confirmation_email_sent").notNull().default(false),
  sessionConfirmationEmailSentAt: timestamp("session_confirmation_email_sent_at"),
  specialRequests: text("special_requests"),
  adminNotes: text("admin_notes"),
  focusAreas: json("focus_areas").$type<string[]>(), // JSON array of focus area names/skills
  focusAreaOther: text("focus_area_other"), // Custom focus area text when "Other" is selected
  progressNote: text("progress_note"), // For Adventure Log progress tracking
  coachName: text("coach_name").default("Coach Will"), // For Adventure Log coach tracking
  dropoffPersonName: text("dropoff_person_name").notNull(),
  dropoffPersonRelationship: text("dropoff_person_relationship").notNull(),
  dropoffPersonPhone: text("dropoff_person_phone").notNull(),
  pickupPersonName: text("pickup_person_name").notNull(),
  pickupPersonRelationship: text("pickup_person_relationship").notNull(),
  pickupPersonPhone: text("pickup_person_phone").notNull(),
  altPickupPersonName: text("alt_pickup_person_name"),
  altPickupPersonRelationship: text("alt_pickup_person_relationship"),
  altPickupPersonPhone: text("alt_pickup_person_phone"),
  safetyVerificationSigned: boolean("safety_verification_signed").notNull().default(false),
  safetyVerificationSignedAt: timestamp("safety_verification_signed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bookingAthletes = pgTable("booking_athletes", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  athleteId: integer("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  slotOrder: integer("slot_order").notNull(), // 1 = first slot, 2 = second, etc.
  // Snapshot + payout computation fields
  gymMemberAtBooking: boolean('gym_member_at_booking').notNull().default(false),
  durationMinutes: integer('duration_minutes'),
  gymRateAppliedCents: integer('gym_rate_applied_cents'),
  gymPayoutOwedCents: integer('gym_payout_owed_cents'),
  gymPayoutComputedAt: timestamp('gym_payout_computed_at'),
  gymPayoutOverrideCents: integer('gym_payout_override_cents'),
  gymPayoutOverrideReason: text('gym_payout_override_reason'),
});

export const bookingLogs = pgTable("booking_logs", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  actionType: text("action_type").notNull(), // "created", "confirmed", "cancelled", "completed", "no-show", "payment_received", "waiver_signed", "rescheduled"
  actionDescription: text("action_description").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  performedBy: text("performed_by").notNull(), // "system", "admin", "parent"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentLogs = pgTable("payment_logs", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  stripeEvent: text("stripe_event"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waivers = pgTable("waivers", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "set null" }), // nullable, FK SET NULL on delete
  athleteId: integer("athlete_id").references(() => athletes.id).notNull(),
  parentId: integer("parent_id").references(() => parents.id).notNull(),
  relationshipToAthlete: text("relationship_to_athlete").default("Parent/Guardian"), // nullable in actual DB
  signature: text("signature").notNull(),
  emergencyContactNumber: text("emergency_contact_number").notNull(),
  understandsRisks: boolean("understands_risks").default(false), // nullable in actual DB
  agreesToPolicies: boolean("agrees_to_policies").default(false), // nullable in actual DB
  authorizesEmergencyCare: boolean("authorizes_emergency_care").default(false), // nullable in actual DB
  allowsPhotoVideo: boolean("allows_photo_video").default(true), // nullable in actual DB
  confirmsAuthority: boolean("confirms_authority").default(false), // nullable in actual DB
  pdfPath: text("pdf_path"), // nullable
  ipAddress: text("ip_address"), // nullable
  userAgent: text("user_agent"), // nullable
  signedAt: timestamp("signed_at").defaultNow(), // nullable in actual DB
  emailSentAt: timestamp("email_sent_at"), // nullable
  createdAt: timestamp("created_at").defaultNow(), // nullable in actual DB
  updatedAt: timestamp("updated_at").defaultNow(), // nullable in actual DB
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  sections: json("sections"),
});

export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sections: json("sections").$type<Array<{
    title: string;
    content: string;
    imageUrl?: string;
  }>>(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  videoUrl: text("video_url"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: time("start_time").notNull(), // Native TIME type
  endTime: time("end_time").notNull(), // Native TIME type
  isRecurring: boolean("is_recurring").default(true).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const availabilityExceptions = pgTable("availability_exceptions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(), // Native DATE type
  startTime: time("start_time").notNull(), // Native TIME type
  endTime: time("end_time").notNull(), // Native TIME type
  isAvailable: boolean("is_available").default(false).notNull(), // Usually false for exceptions (blocked times)
  reason: text("reason"), // Optional reason for the exception
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Normalized lookup tables for apparatus, focus areas, side quests, and genders
export const apparatus = pgTable("apparatus", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const focusAreas = pgTable("focus_areas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  apparatusId: integer("apparatus_id").references(() => apparatus.id),
  level: varchar("level", { length: 20 }).notNull().default('intermediate'),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sideQuests = pgTable("side_quests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const genders = pgTable("genders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Join tables for booking relationships
export const bookingApparatus = pgTable("booking_apparatus", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  apparatusId: integer("apparatus_id").notNull().references(() => apparatus.id, { onDelete: "cascade" }),
});

export const bookingFocusAreas = pgTable("booking_focus_areas", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  focusAreaId: integer("focus_area_id").notNull().references(() => focusAreas.id, { onDelete: "cascade" }),
});

export const bookingSideQuests = pgTable("booking_side_quests", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  sideQuestId: integer("side_quest_id").notNull().references(() => sideQuests.id, { onDelete: "cascade" }),
});

// Admin authentication table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const insertParentSchema = createInsertSchema(parents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  passwordHash: z.string().min(1), // required on signup
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
});

export const insertBlogEmailSignupSchema = createInsertSchema(blogEmailSignups).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
});

export const insertAthleteSchema = createInsertSchema(athletes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  gender: z.string().optional(), // Will be validated against genders table
  isGymMember: z.boolean().optional(),
});

// Gym payout rates (effective-dated)
export const gymPayoutRates = pgTable('gym_payout_rates', {
  id: serial('id').primaryKey(),
  durationMinutes: integer('duration_minutes').notNull(), // e.g., 30 or 60
  isMember: boolean('is_member').notNull(),
  rateCents: integer('rate_cents').notNull(),
  effectiveFrom: timestamp('effective_from').notNull(),
  effectiveTo: timestamp('effective_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Gym payout runs (monthly/period summaries)
export const gymPayoutRuns = pgTable('gym_payout_runs', {
  id: serial('id').primaryKey(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  status: text('status').notNull().default('open'), // open | locked | archived
  totalSessions: integer('total_sessions').notNull().default(0),
  totalOwedCents: integer('total_owed_cents').notNull().default(0),
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Foreign key IDs (required)
  parentId: z.number().positive("Parent ID is required"),
  lessonTypeId: z.number().positive("Lesson type ID is required"),
  waiverId: z.number().positive().nullable().optional(),
  
  // Core booking details
  preferredDate: z.coerce.date(),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  
  // Status enums
  status: z.nativeEnum(BookingStatusEnum).default(BookingStatusEnum.PENDING),
  bookingMethod: z.nativeEnum(BookingMethodEnum).default(BookingMethodEnum.WEBSITE),
  paymentStatus: z.nativeEnum(PaymentStatusEnum).default(PaymentStatusEnum.UNPAID),
  attendanceStatus: z.nativeEnum(AttendanceStatusEnum).default(AttendanceStatusEnum.PENDING),
  
  // Arrays for junction table relationships
  apparatusIds: z.array(z.number()).max(4).default([]),
  focusAreaIds: z.array(z.number()).max(8).default([]),
  focusAreaOther: z.string().optional(), // Custom focus area text when "Other" is selected
  sideQuestIds: z.array(z.number()).max(4).default([]),
  
  // Legacy support for parent info (will be used to find/create parentId)
  parentFirstName: z.string().optional(),
  parentLastName: z.string().optional(), 
  parentEmail: z.string().email().optional(),
  parentPhone: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  
  // Legacy support for lesson type (will be used to find lessonTypeId)
  lessonType: z.string().optional(),
  
  safetyVerificationSignedAt: z.union([z.date(), z.string().transform(str => new Date(str))]).nullable().optional(),
  // Safety verification fields
  dropoffPersonName: z.string().min(1, "Dropoff person name is required"),
  dropoffPersonRelationship: z.enum(["Parent", "Guardian", "Grandparent", "Aunt/Uncle", "Sibling", "Family Friend", "Other"]),
  dropoffPersonPhone: z.string().min(1, "Dropoff person phone is required"),
  pickupPersonName: z.string().min(1, "Pickup person name is required"),
  pickupPersonRelationship: z.enum(["Parent", "Guardian", "Grandparent", "Aunt/Uncle", "Sibling", "Family Friend", "Other"]),
  pickupPersonPhone: z.string().min(1, "Pickup person phone is required"),
  altPickupPersonRelationship: z.enum(["Parent", "Guardian", "Grandparent", "Aunt/Uncle", "Sibling", "Family Friend", "Other"]).nullable().optional(),
  // Athletes array for booking creation
  athletes: z.array(z.object({
    athleteId: z.number().nullable().optional(), // Optional for new athletes, can be null
    slotOrder: z.number(),
    name: z.string(),
    dateOfBirth: z.string(),
    gender: z.string().optional(), // Will be validated against genders table
    allergies: z.string().optional(),
    experience: z.string(),
    photo: z.string().optional(),
  })).optional(),
});

export const insertBookingAthleteSchema = createInsertSchema(bookingAthletes).omit({
  id: true,
});

export const insertBookingLogSchema = createInsertSchema(bookingLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  publishedAt: true,
});

export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  publishedAt: true,
}).extend({
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    imageUrl: z.string().optional(),
  })).optional(),
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
  createdAt: true,
}).extend({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

export const insertAvailabilityExceptionSchema = z.object({
  date: z.coerce.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format").optional(),
  isAvailable: z.boolean().default(false),
  reason: z.string().optional(),
}).transform((data) => {
  // Handle both camelCase and snake_case
  return {
    date: data.date,
    startTime: data.startTime || data.start_time!,
    endTime: data.endTime || data.end_time!,
    isAvailable: data.isAvailable,
    reason: data.reason,
  };
}).refine((data) => {
  return data.startTime && data.endTime;
}, {
  message: "Both start time and end time are required",
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email(),
});

// Insert schemas for normalized lookup tables
export const insertApparatusSchema = createInsertSchema(apparatus).omit({
  id: true,
  createdAt: true,
});

export const insertFocusAreaSchema = createInsertSchema(focusAreas).omit({
  id: true,
  createdAt: true,
});

export const insertSideQuestSchema = createInsertSchema(sideQuests).omit({
  id: true,
  createdAt: true,
});

export const insertGenderSchema = createInsertSchema(genders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas for join tables
export const insertBookingApparatusSchema = createInsertSchema(bookingApparatus).omit({
  id: true,
});

export const insertBookingFocusAreaSchema = createInsertSchema(bookingFocusAreas).omit({
  id: true,
});

export const insertBookingSideQuestSchema = createInsertSchema(bookingSideQuests).omit({
  id: true,
});

// TypeScript types for normalized lookup tables and their relationships
export type Apparatus = typeof apparatus.$inferSelect;
export type FocusArea = typeof focusAreas.$inferSelect;
export type SideQuest = typeof sideQuests.$inferSelect;
export type Gender = typeof genders.$inferSelect;

export type InsertApparatus = z.infer<typeof insertApparatusSchema>;
export type InsertFocusArea = z.infer<typeof insertFocusAreaSchema>;
export type InsertSideQuest = z.infer<typeof insertSideQuestSchema>;
export type InsertGender = z.infer<typeof insertGenderSchema>;

export type BookingApparatus = typeof bookingApparatus.$inferSelect;
export type BookingFocusArea = typeof bookingFocusAreas.$inferSelect;
export type BookingSideQuest = typeof bookingSideQuests.$inferSelect;

export type InsertBookingApparatus = z.infer<typeof insertBookingApparatusSchema>;
export type InsertBookingFocusArea = z.infer<typeof insertBookingFocusAreaSchema>;
export type InsertBookingSideQuest = z.infer<typeof insertBookingSideQuestSchema>;

// Enhanced booking type with normalized relationships
// Enhanced booking type with normalized relationships
export type BookingWithRelations = Booking & {
  // Related entities via foreign keys
  parent?: Parent;
  lessonType?: LessonType;
  waiver?: Waiver;
  
  // Junction table relationships
  apparatus: Array<{ id: number; name: string }>;
  focusAreas: string[]; // Array of focus area names/skills
  sideQuests: Array<{ id: number; name: string }>;
  athletes?: Array<Athlete>;
  
  // Legacy fields for backward compatibility
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  lessonTypeName?: string;
  amount?: number;
  waiverSigned?: boolean;
  waiverSignedAt?: Date | null;
  waiverSignatureName?: string;
};

export const insertWaiverSchema = createInsertSchema(waivers).omit({
  id: true,
  emailSentAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  relationshipToAthlete: z.string().min(1),
  signature: z.string().min(1),
  emergencyContactNumber: z.string().min(1),
  signedAt: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export type Parent = typeof parents.$inferSelect;
export type InsertParent = z.infer<typeof insertParentSchema>;
export type BlogEmailSignup = typeof blogEmailSignups.$inferSelect;
export type InsertBlogEmailSignup = typeof blogEmailSignups.$inferInsert;
// Legacy aliases for backward compatibility
export type Customer = Parent;
export type InsertCustomer = InsertParent;
export const insertCustomerSchema = insertParentSchema;
export const customers = parents; // Table alias for backward compatibility
export type Athlete = typeof athletes.$inferSelect;
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
export type GymPayoutRate = typeof gymPayoutRates.$inferSelect;
export type InsertGymPayoutRate = typeof gymPayoutRates.$inferInsert;
export type GymPayoutRun = typeof gymPayoutRuns.$inferSelect;
export type InsertGymPayoutRun = typeof gymPayoutRuns.$inferInsert;
export type Booking = typeof bookings.$inferSelect & {
  // Legacy athlete properties for backward compatibility (still used by storage)
  athlete1Name?: string;
  athlete1DateOfBirth?: string;
  athlete1Allergies?: string | null;
  athlete1Experience?: string;
  athlete2Name?: string | null;
  athlete2DateOfBirth?: string | null;
  athlete2Allergies?: string | null;
  athlete2Experience?: string | null;
  // Emergency contact fields from bookings_with_details view
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Parent email field from bookings_with_details view  
  parentEmail?: string;
  // Legacy parent fields for backward compatibility
  parentFirstName?: string;
  parentLastName?: string;
  parentPhone?: string;
  // Legacy lesson type fields for backward compatibility
  lessonType?: string;
  lessonTypeName?: string;
  // Legacy amount field for backward compatibility
  amount?: string;
  // Legacy waiver field for backward compatibility
  waiverSigned?: boolean;
  // Parent object for compatibility
  parent?: Parent;
  // Display properties added by backend transformations
  displayPaymentStatus?: string;
  athletes?: Array<{
    athleteId?: number | null; // Optional for new athletes, can be null
    slotOrder: number;
    name: string;
    dateOfBirth: string;
    allergies?: string;
    experience: string;
    photo?: string;
  }>;
  // Track when attendance status was last manually changed
  lastStatusChangeTime?: Date | string | null;
};
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type BookingAthlete = typeof bookingAthletes.$inferSelect;
export type InsertBookingAthlete = z.infer<typeof insertBookingAthleteSchema>;
export type BookingLog = typeof bookingLogs.$inferSelect;
export type InsertBookingLog = z.infer<typeof insertBookingLogSchema>;
export type Waiver = typeof waivers.$inferSelect & {
  // Fields added by storage layer joins/transformations
  athleteName?: string;
  signerName?: string;
};
export type InsertWaiver = z.infer<typeof insertWaiverSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type AvailabilityException = typeof availabilityExceptions.$inferSelect;
export type InsertAvailabilityException = z.infer<typeof insertAvailabilityExceptionSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type ParentVerificationToken = typeof parentVerificationTokens.$inferSelect;
export type InsertParentVerificationToken = typeof parentVerificationTokens.$inferInsert;
export type ParentPasswordResetToken = typeof parentPasswordResetTokens.$inferSelect;
export type InsertParentPasswordResetToken = typeof parentPasswordResetTokens.$inferInsert;

// Lesson types
export type LessonType = typeof lessonTypes.$inferSelect;
export type InsertLessonType = typeof lessonTypes.$inferInsert;

// NOTE: parent_auth_codes table is not implemented - the application uses 
// magic code authentication via Resend API instead of database storage
// 
// Parent authentication codes table (COMMENTED OUT - not in use)
// export const parentAuthCodes = pgTable("parent_auth_codes", {
//   id: serial("id").primaryKey(),
//   email: varchar("email", { length: 255 }).notNull(),
//   code: varchar("code", { length: 6 }).notNull(),
//   expiresAt: timestamp("expires_at").notNull(),
//   used: boolean("used").default(false).notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// export const insertParentAuthCodeSchema = createInsertSchema(parentAuthCodes).omit({
//   id: true,
//   createdAt: true,
// });

// export type ParentAuthCode = typeof parentAuthCodes.$inferSelect;
// export type InsertParentAuthCode = z.infer<typeof insertParentAuthCodeSchema>;

// Slot reservations table for temporary slot holding during booking flow
export const slotReservations = pgTable("slot_reservations", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  startTime: varchar("start_time", { length: 8 }).notNull(), // HH:MM format
  lessonType: varchar("lesson_type", { length: 50 }).notNull(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSlotReservationSchema = createInsertSchema(slotReservations).omit({
  id: true,
  createdAt: true,
});

export type SlotReservation = typeof slotReservations.$inferSelect;
export type InsertSlotReservation = z.infer<typeof insertSlotReservationSchema>;

// Archived waivers table for legal record keeping
export const archivedWaivers = pgTable("archived_waivers", {
  id: serial("id").primaryKey(),
  originalWaiverId: integer("original_waiver_id"), // Reference to original waiver before archiving
  athleteName: text("athlete_name").notNull(),
  signerName: text("signer_name").notNull(),
  relationshipToAthlete: text("relationship_to_athlete").notNull(),
  signature: text("signature").notNull(),
  emergencyContactNumber: text("emergency_contact_number").notNull(),
  understandsRisks: boolean("understands_risks").notNull(),
  agreesToPolicies: boolean("agrees_to_policies").notNull(),
  authorizesEmergencyCare: boolean("authorizes_emergency_care").notNull(),
  allowsPhotoVideo: boolean("allows_photo_video").notNull(),
  confirmsAuthority: boolean("confirms_authority").notNull(),
  pdfPath: text("pdf_path"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").notNull(),
  emailSentAt: timestamp("email_sent_at"),
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
  archiveReason: text("archive_reason").notNull(),
  legalRetentionPeriod: text("legal_retention_period"), // Date until which record must be kept
  originalParentId: integer("original_parent_id"), // Original parent ID before deletion
  originalAthleteId: integer("original_athlete_id"), // Original athlete ID before deletion
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations - defined after all tables to avoid circular references
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  parent: one(parents, {
    fields: [bookings.parentId],
    references: [parents.id],
  }),
  lessonType: one(lessonTypes, {
    fields: [bookings.lessonTypeId],
    references: [lessonTypes.id],
  }),
  waiver: one(waivers, {
    fields: [bookings.waiverId],
    references: [waivers.id],
  }),
  athletes: many(bookingAthletes),
  apparatus: many(bookingApparatus),
  sideQuests: many(bookingSideQuests),
  logs: many(bookingLogs),
}));

export const parentsRelations = relations(parents, ({ many }) => ({
  bookings: many(bookings),
  athletes: many(athletes),
  waivers: many(waivers),
}));

export const lessonTypesRelations = relations(lessonTypes, ({ many }) => ({
  bookings: many(bookings),
}));

export const waiversRelations = relations(waivers, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [waivers.bookingId],
    references: [bookings.id],
  }),
  athlete: one(athletes, {
    fields: [waivers.athleteId],
    references: [athletes.id],
  }),
  parent: one(parents, {
    fields: [waivers.parentId],
    references: [parents.id],
  }),
  bookingsUsingThisWaiver: many(bookings, {
    relationName: "waiverReference"
  }),
}));

export const athletesRelations = relations(athletes, ({ one, many }) => ({
  parent: one(parents, {
    fields: [athletes.parentId],
    references: [parents.id],
  }),
  latestWaiver: one(waivers, {
    fields: [athletes.latestWaiverId],
    references: [waivers.id],
  }),
  waivers: many(waivers),
  bookingAthletes: many(bookingAthletes),
}));

export const bookingAthletesRelations = relations(bookingAthletes, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingAthletes.bookingId],
    references: [bookings.id],
  }),
  athlete: one(athletes, {
    fields: [bookingAthletes.athleteId],
    references: [athletes.id],
  }),
}));

export const athleteWaiverRelations = relations(athletes, ({ one }) => ({
  latestWaiver: one(waivers, {
    fields: [athletes.latestWaiverId],
    references: [waivers.id],
  }),
}));

export const insertArchivedWaiverSchema = createInsertSchema(archivedWaivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ArchivedWaiver = typeof archivedWaivers.$inferSelect;
export type InsertArchivedWaiver = z.infer<typeof insertArchivedWaiverSchema>;

// Athlete with waiver status view type - matches the SQL view created in migration
export type AthleteWithWaiverStatus = Athlete & {
  waiverSignedAt?: string | null;
  waiverSignatureId?: number | null; // The parent_id who signed
  waiverSignatureData?: string | null; // The actual digital signature
  waiverSignerName?: string | null; // The name of the person who signed the waiver
  waiverCreatedAt?: string | null;
  computedWaiverStatus?: 'signed' | 'pending' | 'none';
};

// Parent with athletes waiver status summary
export type ParentWithAthletesWaiverStatus = {
  parent_id: number;
  parent_first_name: string;
  parent_last_name: string;
  parent_email: string;
  parent_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  parent_created_at: Date;
  total_athletes: number;
  athletes_with_waivers: number;
  athletes_without_waivers: number;
  athletes_waiver_info: Array<{
    athlete_id: number;
    athlete_name: string;
    waiver_signed: boolean;
    waiver_signed_at: Date | null;
    latest_waiver_id: number | null;
  }>;
};

// Helper functions for focus area mapping
export function mapFocusAreaNamesToIds(focusAreaNames: string[]): number[] {
  // This is a placeholder - in a real app, you would need to query the database
  // to get the actual IDs for the given names. For now, return empty array.
  console.warn('mapFocusAreaNamesToIds is a placeholder function - implement with actual database lookup');
  return [];
}

export function mapFocusAreaIdsToNames(focusAreaIds: number[]): string[] {
  // This is a placeholder - in a real app, you would need to query the database
  // to get the actual names for the given IDs. For now, return empty array.
  console.warn('mapFocusAreaIdsToNames is a placeholder function - implement with actual database lookup');
  return [];
}

// Site Content Management Tables
export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  bannerVideo: text("banner_video").default(""),
  heroImages: json("hero_images").default([]),
  logo: json("logo").default({ circle: "", text: "" }),
  about: json("about").default({
    bio: "Coach Will brings nearly 10 years of passionate gymnastics instruction to every lesson.",
    experience: "Nearly 10 years of coaching experience with athletes of all levels",
    photo: "",
    certifications: [
      { title: "USA Gymnastics Certified", body: "Official certification from USA Gymnastics" },
      { title: "CPR/First Aid Certified", body: "Current safety and emergency response training" },
      { title: "Background Checked", body: "Comprehensive background verification completed" }
    ]
  }),
  contact: json("contact").default({
    phone: "(585) 755-8122",
    email: "Admin@coachwilltumbles.com",
    address: {
      name: "Oceanside Gymnastics",
      street: "1935 Ave. del Oro #A",
      city: "Oceanside",
      state: "CA",
      zip: "92056"
    }
  }),
  hours: json("hours").default({
    monday: { available: true, start: "9:00 AM", end: "4:00 PM" },
    tuesday: { available: true, start: "9:00 AM", end: "3:30 PM" },
    wednesday: { available: true, start: "9:00 AM", end: "4:00 PM" },
    thursday: { available: true, start: "9:00 AM", end: "3:30 PM" },
    friday: { available: true, start: "9:00 AM", end: "4:00 PM" },
    saturday: { available: true, start: "10:00 AM", end: "2:00 PM" },
    sunday: { available: false, start: "", end: "" }
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  text: text("text").notNull(),
  rating: integer("rating").default(5),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteFaqs = pgTable("site_faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }).default("General"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Validation schemas for site content
export const insertSiteContentSchema = createInsertSchema(siteContent);
export const insertTestimonialSchema = createInsertSchema(testimonials);
export const insertSiteFaqSchema = createInsertSchema(siteFaqs);

// Types for site content
export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type SiteFaq = typeof siteFaqs.$inferSelect;
export type InsertSiteFaq = z.infer<typeof insertSiteFaqSchema>;

// Site content API response type
export type SiteContentResponse = {
  bannerVideo: string;
  heroImages: string[];
  about: {
    bio: string;
    experience: string;
    photo: string;
    certifications: Array<{ title: string; body: string }>;
  };
  contact: {
    phone: string;
    email: string;
    address: {
      name: string;
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  hours: {
    [key: string]: { start: string; end: string; available: boolean };
  };
  testimonials: Array<{
    id: number;
    name: string;
    text: string;
    rating: number;
    featured: boolean;
  }>;
  faqs: Array<{
    id: number;
    question: string;
    answer: string;
    category: string;
    displayOrder: number;
  }>;
};
