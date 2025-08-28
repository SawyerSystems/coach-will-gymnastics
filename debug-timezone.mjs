#!/usr/bin/env node

import dotenv from 'dotenv';
import { formatToPacificISO, getTodayInPacific } from './shared/timezone-utils.js';

// Load environment variables
dotenv.config();

// Test the timezone comparison logic
const now = new Date();
const nowPacific = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
const todayPacificISO = formatToPacificISO(getTodayInPacific());

console.log('🔍 Testing timezone comparison logic...\n');
console.log('Current time UTC:', now.toISOString());
console.log('Current time Pacific (INCORRECT method):', nowPacific.toISOString());
console.log('Today Pacific ISO (correct method):', todayPacificISO);
console.log('Test date (what API receives):', '2025-08-27');
console.log('Dates match?', '2025-08-27' === todayPacificISO);
console.log('');

console.log('Current minutes Pacific (incorrect):', nowPacific.getHours() * 60 + nowPacific.getMinutes());
console.log('Current hours Pacific (incorrect):', nowPacific.getHours() + ':' + nowPacific.getMinutes().toString().padStart(2, '0'));

// Test what the correct Pacific time should be
const correctPacific = getTodayInPacific();
console.log('Correct Pacific time:', correctPacific.toISOString());
console.log('Correct Pacific hours:', correctPacific.getHours() + ':' + correctPacific.getMinutes().toString().padStart(2, '0'));
console.log('Correct minutes:', correctPacific.getHours() * 60 + correctPacific.getMinutes());
