#!/usr/bin/env node

// Quick test to verify the athlete skill video insertion fix
import fetch from 'node-fetch';

async function testVideoInsertion() {
  try {
    console.log('🧪 Testing athlete skill video insertion fix...\n');
    
    // First, get a test athlete skill ID
    const skillsResponse = await fetch('http://localhost:5001/api/admin/athletes/111/skills', {
      headers: {
        'Cookie': 'cwt.sid.dev=s%3A3KMo6NeqRjRIuqCXdTtFnZZE9Xl3VFvE.DEOHeWQS5dxR02Gk%2Fe5PmnnpDLhld50a%2B%2FsDT4uQoNI'
      }
    });
    
    if (!skillsResponse.ok) {
      throw new Error(`Failed to get athlete skills: ${skillsResponse.status}`);
    }
    
    const skills = await skillsResponse.json();
    console.log(`✅ Found ${skills.length} athlete skills`);
    
    if (skills.length === 0) {
      console.log('❌ No athlete skills found to test with');
      return;
    }
    
    const testSkill = skills[0];
    console.log(`🎯 Testing with skill: ${testSkill.skill?.name || 'Unknown'} (ID: ${testSkill.id})\n`);
    
    // Test video data
    const testVideo = {
      athleteSkillId: testSkill.id,
      url: 'https://example.com/test-video.mp4',
      title: 'Test Video - Fix Verification',
      recordedAt: new Date().toISOString()
    };
    
    console.log('📤 Attempting to add test video...');
    
    // Attempt to add the video
    const addResponse = await fetch('http://localhost:5001/api/admin/athlete-skill-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'cwt.sid.dev=s%3A3KMo6NeqRjRIuqCXdTtFnZZE9Xl3VFvE.DEOHeWQS5dxR02Gk%2Fe5PmnnpDLhld50a%2B%2FsDT4uQoNI'
      },
      body: JSON.stringify(testVideo)
    });
    
    if (addResponse.ok) {
      const result = await addResponse.json();
      console.log('✅ SUCCESS! Video added successfully');
      console.log(`📹 Video ID: ${result.id}`);
      console.log(`🔢 Sort Index: ${result.sortIndex}`);
      console.log(`📅 Display Date: ${result.displayDate}`);
      console.log(`📊 Processing Status: ${result.processingStatus}\n`);
      
      // Clean up - delete the test video
      console.log('🧹 Cleaning up test video...');
      const deleteResponse = await fetch(`http://localhost:5001/api/admin/athlete-skill-videos/${result.id}`, {
        method: 'DELETE',
        headers: {
          'Cookie': 'cwt.sid.dev=s%3A3KMo6NeqRjRIuqCXdTtFnZZE9Xl3VFvE.DEOHeWQS5dxR02Gk%2Fe5PmnnpDLhld50a%2B%2FsDT4uQoNI'
        }
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Test video deleted successfully');
      } else {
        console.log('⚠️  Test video deletion failed (manual cleanup needed)');
      }
      
      console.log('\n🎉 FIX VERIFIED! The sort_index issue has been resolved.');
      
    } else {
      const error = await addResponse.text();
      console.log('❌ FAILED! Video addition still failing:');
      console.log(`Status: ${addResponse.status}`);
      console.log(`Error: ${error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testVideoInsertion();
