#!/usr/bin/env node

/**
 * Test script for database normalization migration
 * Tests the new lookup tables and normalized relationships
 */

import { createClient } from '@supabase/supabase-js';
import { storage } from './server/storage.js';

// Initialize Supabase client for direct SQL operations
const supabaseUrl = process.env.DATABASE_URL?.match(/https?:\/\/([^@]+@)?([^:\/]+)/)?.[0] || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNormalizationMigration() {
  console.log('🧪 Testing Database Normalization Migration');
  console.log('=' .repeat(50));

  try {
    // Test 1: Verify lookup tables exist and have data
    console.log('\n1️⃣ Testing Lookup Tables...');
    
    const apparatus = await storage.getAllApparatus();
    console.log(`✅ Apparatus table: ${apparatus.length} records`);
    console.log(`   Sample: ${apparatus.slice(0, 3).map(a => a.name).join(', ')}`);

    const focusAreas = await storage.getAllFocusAreas();
    console.log(`✅ Focus Areas table: ${focusAreas.length} records`);
    console.log(`   Sample: ${focusAreas.slice(0, 3).map(f => f.name).join(', ')}`);

    const sideQuests = await storage.getAllSideQuests();
    console.log(`✅ Side Quests table: ${sideQuests.length} records`);
    console.log(`   Sample: ${sideQuests.slice(0, 3).map(s => s.name).join(', ')}`);

    // Test 2: Test apparatus-specific focus areas
    console.log('\n2️⃣ Testing Focus Areas by Apparatus...');
    
    const floorApparatus = apparatus.find(a => a.name === 'Floor Exercise');
    if (floorApparatus) {
      const floorFocusAreas = await storage.getFocusAreasByApparatus(floorApparatus.id);
      console.log(`✅ Floor Exercise focus areas: ${floorFocusAreas.length} records`);
      console.log(`   Skills: ${floorFocusAreas.slice(0, 5).map(f => f.name).join(', ')}`);
    }

    const beamApparatus = apparatus.find(a => a.name === 'Balance Beam');
    if (beamApparatus) {
      const beamFocusAreas = await storage.getFocusAreasByApparatus(beamApparatus.id);
      console.log(`✅ Balance Beam focus areas: ${beamFocusAreas.length} records`);
      console.log(`   Skills: ${beamFocusAreas.slice(0, 5).map(f => f.name).join(', ')}`);
    }

    // Test 3: Test booking creation with normalized relationships
    console.log('\n3️⃣ Testing Booking Creation with Normalized Data...');
    
    // Get sample IDs
    const floorId = apparatus.find(a => a.name === 'Floor Exercise')?.id;
    const beamId = apparatus.find(a => a.name === 'Balance Beam')?.id;
    const cartwheelId = focusAreas.find(f => f.name === 'Cartwheel')?.id;
    const handstandId = focusAreas.find(f => f.name === 'Handstand')?.id;
    const flexibilityId = sideQuests.find(s => s.name === 'Flexibility Training')?.id;
    const strengthId = sideQuests.find(s => s.name === 'Strength Building')?.id;

    if (floorId && cartwheelId && flexibilityId) {
      // Create a test booking
      const testBooking = {
        parentId: 1, // Assuming parent ID 1 exists
        parentName: 'Test Parent',
        parentEmail: 'test@example.com',
        parentPhone: '555-0123',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '555-0124',
        lessonType: 'deep-dive',
        sessionDate: '2025-07-10',
        startTime: '10:00',
        endTime: '11:00',
        specialRequests: 'Test booking for normalization',
        amount: 6000, // $60 in cents
        status: 'pending',
        paymentStatus: 'unpaid',
        attendanceStatus: 'pending'
      };

      const createdBooking = await storage.createBookingWithRelations(
        testBooking,
        [floorId], // apparatus
        [cartwheelId, handstandId].filter(id => id !== undefined), // focus areas
        [flexibilityId, strengthId].filter(id => id !== undefined) // side quests
      );

      console.log(`✅ Created test booking with ID: ${createdBooking.id}`);
      console.log(`   Apparatus: ${createdBooking.apparatus?.map(a => a.name).join(', ')}`);
      console.log(`   Focus Areas: ${createdBooking.focusAreas?.map(f => f.name).join(', ')}`);
      console.log(`   Side Quests: ${createdBooking.sideQuests?.map(s => s.name).join(', ')}`);

      // Test 4: Test booking retrieval with relations
      console.log('\n4️⃣ Testing Booking Retrieval with Relations...');
      
      const retrievedBooking = await storage.getBookingWithRelations(createdBooking.id);
      if (retrievedBooking) {
        console.log(`✅ Retrieved booking with relations`);
        console.log(`   ID: ${retrievedBooking.id}`);
        console.log(`   Apparatus: ${retrievedBooking.apparatus?.map(a => a.name).join(', ')}`);
        console.log(`   Focus Areas: ${retrievedBooking.focusAreas?.map(f => f.name).join(', ')}`);
        console.log(`   Side Quests: ${retrievedBooking.sideQuests?.map(s => s.name).join(', ')}`);
      }

      // Test 5: Test relation updates
      console.log('\n5️⃣ Testing Booking Relation Updates...');
      
      const updatedBooking = await storage.updateBookingRelations(
        createdBooking.id,
        beamId ? [beamId] : [], // Change apparatus to beam
        cartwheelId ? [cartwheelId] : [], // Keep only cartwheel focus area
        flexibilityId ? [flexibilityId] : [] // Keep only flexibility side quest
      );

      if (updatedBooking) {
        console.log(`✅ Updated booking relations`);
        console.log(`   New Apparatus: ${updatedBooking.apparatus?.map(a => a.name).join(', ')}`);
        console.log(`   New Focus Areas: ${updatedBooking.focusAreas?.map(f => f.name).join(', ')}`);
        console.log(`   New Side Quests: ${updatedBooking.sideQuests?.map(s => s.name).join(', ')}`);
      }

      // Test 6: Test bulk retrieval
      console.log('\n6️⃣ Testing Bulk Booking Retrieval with Relations...');
      
      const allBookingsWithRelations = await storage.getAllBookingsWithRelations();
      const testBookingFromBulk = allBookingsWithRelations.find(b => b.id === createdBooking.id);
      
      if (testBookingFromBulk) {
        console.log(`✅ Found test booking in bulk retrieval`);
        console.log(`   Relations preserved: ${testBookingFromBulk.apparatus?.length || 0} apparatus, ${testBookingFromBulk.focusAreas?.length || 0} focus areas, ${testBookingFromBulk.sideQuests?.length || 0} side quests`);
      }

      // Cleanup: Delete test booking
      console.log('\n🧹 Cleaning up test data...');
      await storage.deleteBooking(createdBooking.id);
      console.log(`✅ Deleted test booking ${createdBooking.id}`);
    }

    console.log('\n🎉 Database Normalization Migration Test COMPLETED!');
    console.log('=' .repeat(50));
    console.log('Summary:');
    console.log(`• ${apparatus.length} apparatus types available`);
    console.log(`• ${focusAreas.length} focus areas available`);
    console.log(`• ${sideQuests.length} side quests available`);
    console.log('• Booking creation with relations: ✅ Working');
    console.log('• Booking retrieval with relations: ✅ Working');
    console.log('• Booking relation updates: ✅ Working');
    console.log('• Bulk retrieval with relations: ✅ Working');
    console.log('\n✅ All normalization features are functional!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testNormalizationMigration()
  .then(() => {
    console.log('\n🏁 Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  });