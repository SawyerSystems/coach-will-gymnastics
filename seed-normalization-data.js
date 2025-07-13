/**
 * Seed the normalization tables with comprehensive gymnastics data
 */

async function seedNormalizationData() {
  console.log('🌱 Seeding normalization tables with gymnastics data...');
  
  try {
    // First, authenticate as admin
    console.log('🔐 Authenticating as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@coachwilltumbles.com',
        password: 'TumbleCoach2025!'
      })
    });
    
    if (!loginResponse.ok) {
      console.error('❌ Admin login failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Admin login successful');
    
    // Extract session cookie for subsequent requests
    const cookies = loginResponse.headers.get('set-cookie');
    const sessionCookie = cookies ? cookies.split(';')[0] : '';
    console.log('📝 Session cookie obtained');
    
    // Helper function to make authenticated requests
    const makeAuthenticatedRequest = async (url, data) => {
      return fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': sessionCookie
        },
        body: JSON.stringify(data)
      });
    };
    // 1. Create apparatus data
    const apparatusData = [
      { name: 'Floor Exercise', description: 'Tumbling and dance skills on floor mat' },
      { name: 'Vault', description: 'Running approach and vaulting over table' },
      { name: 'Uneven Bars', description: 'Swinging and release skills on parallel bars' },
      { name: 'Balance Beam', description: 'Skills performed on narrow beam' },
      { name: 'Pommel Horse', description: 'Circular movements and flairs on horse' },
      { name: 'Still Rings', description: 'Strength and swing elements on rings' },
      { name: 'Parallel Bars', description: 'Support and swing skills on parallel bars' },
      { name: 'High Bar', description: 'Swinging and release elements on horizontal bar' },
      { name: 'Trampoline', description: 'Bouncing and aerial skills on trampoline' },
      { name: 'Tumbling', description: 'Power tumbling on spring floor' }
    ];

    console.log('Creating apparatus records...');
    for (const apparatus of apparatusData) {
      try {
        const response = await makeAuthenticatedRequest('http://localhost:5000/api/apparatus', apparatus);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Created apparatus: ${apparatus.name} (ID: ${result.id})`);
        } else {
          const error = await response.text();
          console.log(`❌ Failed to create ${apparatus.name}: ${error}`);
        }
      } catch (error) {
        console.error(`❌ Error creating ${apparatus.name}:`, error.message);
      }
    }

    // Wait a moment for apparatus to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get created apparatus to get their IDs
    const apparatusResponse = await fetch('http://localhost:5000/api/apparatus');
    const createdApparatus = await apparatusResponse.json();
    console.log(`📋 Created ${createdApparatus.length} apparatus records`);

    // 2. Create focus areas data (apparatus-specific skills)
    const focusAreasData = [
      // Floor Exercise (ID: 1)
      { name: 'Forward Roll', apparatus_id: 1, difficulty_level: 'beginner' },
      { name: 'Backward Roll', apparatus_id: 1, difficulty_level: 'beginner' },
      { name: 'Cartwheel', apparatus_id: 1, difficulty_level: 'beginner' },
      { name: 'Round-off', apparatus_id: 1, difficulty_level: 'intermediate' },
      { name: 'Back Handspring', apparatus_id: 1, difficulty_level: 'intermediate' },
      { name: 'Front Handspring', apparatus_id: 1, difficulty_level: 'intermediate' },
      { name: 'Back Tuck', apparatus_id: 1, difficulty_level: 'advanced' },
      { name: 'Layout', apparatus_id: 1, difficulty_level: 'advanced' },
      
      // Vault (ID: 2)
      { name: 'Straight Jump', apparatus_id: 2, difficulty_level: 'beginner' },
      { name: 'Squat Vault', apparatus_id: 2, difficulty_level: 'beginner' },
      { name: 'Straddle Vault', apparatus_id: 2, difficulty_level: 'intermediate' },
      { name: 'Handspring Vault', apparatus_id: 2, difficulty_level: 'advanced' },
      
      // Uneven Bars (ID: 3)
      { name: 'Pull-ups', apparatus_id: 3, difficulty_level: 'beginner' },
      { name: 'Glide Swings', apparatus_id: 3, difficulty_level: 'beginner' },
      { name: 'Cast', apparatus_id: 3, difficulty_level: 'intermediate' },
      { name: 'Back Hip Circle', apparatus_id: 3, difficulty_level: 'intermediate' },
      { name: 'Kip', apparatus_id: 3, difficulty_level: 'advanced' },
      
      // Balance Beam (ID: 4)
      { name: 'Straight Walk', apparatus_id: 4, difficulty_level: 'beginner' },
      { name: 'Relevé Walk', apparatus_id: 4, difficulty_level: 'beginner' },
      { name: 'Straight Jump', apparatus_id: 4, difficulty_level: 'beginner' },
      { name: 'Cartwheel', apparatus_id: 4, difficulty_level: 'intermediate' },
      { name: 'Back Walkover', apparatus_id: 4, difficulty_level: 'advanced' },
      
      // Pommel Horse (ID: 5)
      { name: 'Support Hold', apparatus_id: 5, difficulty_level: 'beginner' },
      { name: 'Leg Cuts', apparatus_id: 5, difficulty_level: 'intermediate' },
      { name: 'Circles', apparatus_id: 5, difficulty_level: 'advanced' },
      
      // Still Rings (ID: 6)
      { name: 'Support Hold', apparatus_id: 6, difficulty_level: 'beginner' },
      { name: 'L-Sit', apparatus_id: 6, difficulty_level: 'intermediate' },
      { name: 'Muscle Up', apparatus_id: 6, difficulty_level: 'advanced' },
      
      // Parallel Bars (ID: 7)
      { name: 'Support Walk', apparatus_id: 7, difficulty_level: 'beginner' },
      { name: 'Swing', apparatus_id: 7, difficulty_level: 'intermediate' },
      { name: 'Handstand', apparatus_id: 7, difficulty_level: 'advanced' },
      
      // High Bar (ID: 8)
      { name: 'Hang', apparatus_id: 8, difficulty_level: 'beginner' },
      { name: 'Glide Swings', apparatus_id: 8, difficulty_level: 'intermediate' },
      { name: 'Tap Swings', apparatus_id: 8, difficulty_level: 'advanced' },
      
      // Trampoline (ID: 9)
      { name: 'Straight Bounce', apparatus_id: 9, difficulty_level: 'beginner' },
      { name: 'Seat Drop', apparatus_id: 9, difficulty_level: 'beginner' },
      { name: 'Front Drop', apparatus_id: 9, difficulty_level: 'intermediate' },
      { name: 'Back Drop', apparatus_id: 9, difficulty_level: 'intermediate' },
      { name: 'Front Flip', apparatus_id: 9, difficulty_level: 'advanced' },
      { name: 'Back Flip', apparatus_id: 9, difficulty_level: 'advanced' },
      
      // Tumbling (ID: 10)
      { name: 'Round-off Back Handspring', apparatus_id: 10, difficulty_level: 'intermediate' },
      { name: 'Standing Back Tuck', apparatus_id: 10, difficulty_level: 'advanced' },
      { name: 'Full Twisting Layout', apparatus_id: 10, difficulty_level: 'advanced' }
    ];

    console.log('Creating focus areas...');
    for (const focusArea of focusAreasData) {
      try {
        const response = await makeAuthenticatedRequest('http://localhost:5000/api/focus-areas', focusArea);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Created focus area: ${focusArea.name}`);
        } else {
          const error = await response.text();
          console.log(`❌ Failed to create ${focusArea.name}: ${error}`);
        }
      } catch (error) {
        console.error(`❌ Error creating ${focusArea.name}:`, error.message);
      }
    }

    // 3. Create side quests data
    const sideQuestsData = [
      { name: 'Flexibility Training', category: 'conditioning', description: 'Improve overall body flexibility and range of motion' },
      { name: 'Strength Building', category: 'conditioning', description: 'Build core strength and muscle endurance' },
      { name: 'Balance Training', category: 'foundational', description: 'Develop proprioception and stability' },
      { name: 'Coordination Drills', category: 'foundational', description: 'Improve body awareness and movement patterns' },
      { name: 'Agility Training', category: 'conditioning', description: 'Enhance speed and quick direction changes' },
      { name: 'Mental Focus', category: 'mindset', description: 'Develop concentration and mental preparation' },
      { name: 'Fear Management', category: 'mindset', description: 'Overcome mental blocks and build confidence' },
      { name: 'Injury Prevention', category: 'safety', description: 'Learn proper warm-up and injury prevention techniques' },
      { name: 'Competition Prep', category: 'performance', description: 'Prepare routines and mindset for competitions' },
      { name: 'Goal Setting', category: 'mindset', description: 'Set and achieve progressive skill goals' }
    ];

    console.log('Creating side quests...');
    for (const sideQuest of sideQuestsData) {
      try {
        const response = await makeAuthenticatedRequest('http://localhost:5000/api/side-quests', sideQuest);
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Created side quest: ${sideQuest.name}`);
        } else {
          const error = await response.text();
          console.log(`❌ Failed to create ${sideQuest.name}: ${error}`);
        }
      } catch (error) {
        console.error(`❌ Error creating ${sideQuest.name}:`, error.message);
      }
    }

    // 4. Verify the seeding
    console.log('\n🔍 Verifying seeded data...');
    
    const finalApparatusResponse = await fetch('http://localhost:5000/api/apparatus');
    const finalApparatus = await finalApparatusResponse.json();
    console.log(`✅ Apparatus: ${finalApparatus.length} records`);
    
    const finalFocusAreasResponse = await fetch('http://localhost:5000/api/focus-areas');
    const finalFocusAreas = await finalFocusAreasResponse.json();
    console.log(`✅ Focus Areas: ${finalFocusAreas.length} records`);
    
    const finalSideQuestsResponse = await fetch('http://localhost:5000/api/side-quests');
    const finalSideQuests = await finalSideQuestsResponse.json();
    console.log(`✅ Side Quests: ${finalSideQuests.length} records`);

    console.log('\n🎉 Normalization data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedNormalizationData();