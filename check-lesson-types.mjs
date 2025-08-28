#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLessonTypes() {
  console.log('🔍 Checking lesson types and reservation fees...\n');

  try {
    // Fetch all lesson types
    const { data: lessonTypes, error } = await supabase
      .from('lesson_types')
      .select('*')
      .order('id');

    if (error) {
      throw new Error(`Failed to fetch lesson types: ${error.message}`);
    }

    console.log('📋 Available lesson types:');
    console.log('-------------------------');

    // Find lesson types with $0 reservation fee
    const zeroFeeLessonTypes = [];

    lessonTypes.forEach(lt => {
      const reservationFee = Number(lt.reservationFee) || 0;
      const price = Number(lt.price) || 0;
      
      console.log(`ID: ${lt.id}`);
      console.log(`Name: ${lt.name}`);
      console.log(`Price: $${price}`);
      console.log(`Reservation Fee: $${reservationFee}`);
      console.log(`Active: ${lt.active ? 'Yes' : 'No'}`);
      console.log('-------------------------');
      
      if (reservationFee === 0) {
        zeroFeeLessonTypes.push(lt);
      }
    });

    console.log('\n🎯 Lesson types with $0 reservation fee:');
    if (zeroFeeLessonTypes.length === 0) {
      console.log('  None found');
    } else {
      zeroFeeLessonTypes.forEach(lt => {
        console.log(`  - ID: ${lt.id}, Name: ${lt.name}, Price: $${Number(lt.price) || 0}`);
      });
    }

    console.log('\n💡 To test $0 booking flow, use a lesson type ID with $0 reservation fee');
    if (zeroFeeLessonTypes.length > 0) {
      console.log(`  Recommended test ID: ${zeroFeeLessonTypes[0].id}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkLessonTypes();
