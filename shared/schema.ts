import { boolean, date, decimal, integer, json, pgEnum, pgTable, serial, text, time, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define PostgreSQL enum types for booking statuses
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending", 
  "paid", 
  "confirmed", 
  "manual", 
  "manual-paid", 
  "completed", 
  "no-show", 
  "failed", 
  "cancelled", 
  "reservation-pending", 
  "reservation-paid", 
  "reservation-failed"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid", 
  "paid", 
  "failed", 
  "refunded", 
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
  MANUAL = "manual",
  MANUAL_PAID = "manual-paid",
  COMPLETED = "completed",
  NO_SHOW = "no-show",
  FAILED = "failed",
  CANCELLED = "cancelled",
  RESERVATION_PENDING = "reservation-pending",
  RESERVATION_PAID = "reservation-paid",
  RESERVATION_FAILED = "reservation-failed"
}

export enum PaymentStatusEnum {
  UNPAID = "unpaid",
  PAID = "paid",
  FAILED = "failed", 
  REFUNDED = "refunded",
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

export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  waiverSigned: boolean("waiver_signed").notNull().default(false),
  waiverSignedAt: timestamp("waiver_signed_at"),
  waiverSignatureName: text("waiver_signature_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const athletes = pgTable("athletes", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => parents.id).notNull(),
  name: text("name").notNull(), // Keep for backward compatibility during migration
  firstName: text("first_name"),
  lastName: text("last_name"),
  dateOfBirth: text("date_of_birth").notNull(),
  gender: text("gender"), // Added gender field
  allergies: text("allergies"),
  experience: text("experience").notNull(),
  photo: text("photo"), // Base64 encoded photo for admin use only
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  lessonType: text("lesson_type").notNull(),
  preferredDate: date("preferred_date").notNull(),
  preferredTime: time("preferred_time").notNull(),
  focusAreas: text("focus_areas").array().notNull(),
  parentFirstName: text("parent_first_name").notNull(),
  parentLastName: text("parent_last_name").notNull(),
  parentEmail: text("parent_email").notNull(),
  parentPhone: text("parent_phone").notNull(),
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  bookingMethod: text("booking_method").notNull().default("online"), // "online", "phone", "in-person", "manual"
  waiverSigned: boolean("waiver_signed").notNull().default(false),
  waiverSignedAt: timestamp("waiver_signed_at"),
  waiverSignatureName: text("waiver_signature_name"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"), // Tracks Stripe payment state
  attendanceStatus: attendanceStatusEnum("attendance_status").notNull().default("pending"), // Tracks session attendance
  reservationFeePaid: boolean("reservation_fee_paid").notNull().default(false),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  specialRequests: text("special_requests"),
  adminNotes: text("admin_notes"),
  // Safety verification fields for pickup/dropoff authorization
  dropoffPersonName: text("dropoff_person_name"),
  dropoffPersonRelationship: text("dropoff_person_relationship"),
  dropoffPersonPhone: text("dropoff_person_phone"),
  pickupPersonName: text("pickup_person_name"),
  pickupPersonRelationship: text("pickup_person_relationship"),
  pickupPersonPhone: text("pickup_person_phone"),
  // Alternative pickup person (optional)
  altPickupPersonName: text("alt_pickup_person_name"),
  altPickupPersonRelationship: text("alt_pickup_person_relationship"),
  altPickupPersonPhone: text("alt_pickup_person_phone"),
  safetyVerificationSigned: boolean("safety_verification_signed").notNull().default(false),
  safetyVerificationSignedAt: timestamp("safety_verification_signed_at"),
  stripeSessionId: text("stripe_session_id"), // Stripe checkout session ID for payment tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingAthletes = pgTable("booking_athletes", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  athleteId: integer("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  slotOrder: integer("slot_order").notNull(), // 1 = first slot, 2 = second, etc.
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
  bookingId: integer("booking_id").references(() => bookings.id),
  athleteId: integer("athlete_id").references(() => athletes.id),
  parentId: integer("parent_id").references(() => parents.id),
  athleteName: text("athlete_name").notNull(),
  signerName: text("signer_name").notNull(),
  relationshipToAthlete: text("relationship_to_athlete").notNull().default("Parent/Guardian"),
  signature: text("signature").notNull(), // Base64 signature data
  emergencyContactNumber: text("emergency_contact_number").notNull(),
  // Checkboxes for the five required agreements
  understandsRisks: boolean("understands_risks").notNull().default(false),
  agreesToPolicies: boolean("agrees_to_policies").notNull().default(false),
  authorizesEmergencyCare: boolean("authorizes_emergency_care").notNull().default(false),
  allowsPhotoVideo: boolean("allows_photo_video").notNull().default(true),
  confirmsAuthority: boolean("confirms_authority").notNull().default(false),
  // PDF and tracking info
  pdfPath: text("pdf_path"), // Storage path for the generated PDF
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
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

// Normalized lookup tables for apparatus, focus areas, and side quests
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
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sideQuests = pgTable("side_quests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
});

export const insertParentSchema = createInsertSchema(parents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAthleteSchema = createInsertSchema(athletes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  focusAreas: true, // Remove old focusAreas field
}).extend({
  lessonType: z.enum(["quick-journey", "dual-quest", "deep-dive", "partner-progression"]),
  preferredDate: z.coerce.date(), // Use native date validation
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"), // Time validation
  status: z.nativeEnum(BookingStatusEnum).default(BookingStatusEnum.PENDING),
  bookingMethod: z.enum(["online", "phone", "in-person", "manual"]).default("online"),
  paymentStatus: z.nativeEnum(PaymentStatusEnum).default(PaymentStatusEnum.UNPAID),
  attendanceStatus: z.nativeEnum(AttendanceStatusEnum).default(AttendanceStatusEnum.PENDING),
  // New normalized arrays for IDs only
  apparatusIds: z.array(z.number()).max(4).default([]),
  focusAreaIds: z.array(z.number()).max(8).default([]),
  sideQuestIds: z.array(z.number()).max(4).default([]),
  amount: z.coerce.string(),
  safetyVerificationSignedAt: z.union([z.date(), z.string().transform(str => new Date(str))]).nullable().optional(),
  waiverSignedAt: z.union([z.date(), z.string().transform(str => new Date(str))]).nullable().optional(),
  // Safety verification fields
  dropoffPersonRelationship: z.enum(["Parent", "Guardian", "Grandparent", "Aunt/Uncle", "Sibling", "Family Friend", "Other"]).nullable().optional(),
  pickupPersonRelationship: z.enum(["Parent", "Guardian", "Grandparent", "Aunt/Uncle", "Sibling", "Family Friend", "Other"]).nullable().optional(),
  altPickupPersonRelationship: z.enum(["Parent", "Guardian", "Grandparent", "Aunt/Uncle", "Sibling", "Family Friend", "Other"]).nullable().optional(),
  // Athletes array for booking creation
  athletes: z.array(z.object({
    athleteId: z.number().nullable().optional(), // Optional for new athletes, can be null
    slotOrder: z.number(),
    name: z.string(),
    dateOfBirth: z.string(),
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

export type InsertApparatus = z.infer<typeof insertApparatusSchema>;
export type InsertFocusArea = z.infer<typeof insertFocusAreaSchema>;
export type InsertSideQuest = z.infer<typeof insertSideQuestSchema>;

export type BookingApparatus = typeof bookingApparatus.$inferSelect;
export type BookingFocusArea = typeof bookingFocusAreas.$inferSelect;
export type BookingSideQuest = typeof bookingSideQuests.$inferSelect;

export type InsertBookingApparatus = z.infer<typeof insertBookingApparatusSchema>;
export type InsertBookingFocusArea = z.infer<typeof insertBookingFocusAreaSchema>;
export type InsertBookingSideQuest = z.infer<typeof insertBookingSideQuestSchema>;

// Enhanced booking type with normalized relationships
export type BookingWithRelations = Booking & {
  apparatus: Array<{ id: number; name: string }>;
  focusAreas: Array<{ id: number; name: string }>;
  sideQuests: Array<{ id: number; name: string }>;
  athletes?: Array<Athlete>;
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
// Legacy aliases for backward compatibility
export type Customer = Parent;
export type InsertCustomer = InsertParent;
export const insertCustomerSchema = insertParentSchema;
export const customers = parents; // Table alias for backward compatibility
export type Athlete = typeof athletes.$inferSelect;
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
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
  athletes?: Array<{
    athleteId?: number | null; // Optional for new athletes, can be null
    slotOrder: number;
    name: string;
    dateOfBirth: string;
    allergies?: string;
    experience: string;
    photo?: string;
  }>;
};
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type BookingAthlete = typeof bookingAthletes.$inferSelect;
export type InsertBookingAthlete = z.infer<typeof insertBookingAthleteSchema>;
export type BookingLog = typeof bookingLogs.$inferSelect;
export type InsertBookingLog = z.infer<typeof insertBookingLogSchema>;
export type Waiver = typeof waivers.$inferSelect;
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

// Parent authentication codes table
export const parentAuthCodes = pgTable("parent_auth_codes", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParentAuthCodeSchema = createInsertSchema(parentAuthCodes).omit({
  id: true,
  createdAt: true,
});

export type ParentAuthCode = typeof parentAuthCodes.$inferSelect;
export type InsertParentAuthCode = z.infer<typeof insertParentAuthCodeSchema>;

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

export const insertArchivedWaiverSchema = createInsertSchema(archivedWaivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ArchivedWaiver = typeof archivedWaivers.$inferSelect;
export type InsertArchivedWaiver = z.infer<typeof insertArchivedWaiverSchema>;
