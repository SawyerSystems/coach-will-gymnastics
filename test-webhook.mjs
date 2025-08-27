#!/usr/bin/env node

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testWebhookTrigger() {
  console.log('🧪 Testing webhook trigger simulation...\n');

  try {
    // Simulate a Stripe webhook call to our local server
    const webhookPayload = {
      id: 'evt_test_webhook',
      object: 'event',
      api_version: '2023-08-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'cs_test_session_id',
          object: 'checkout.session',
          amount_total: 12000, // $120.00 in cents
          currency: 'usd',
          customer_email: 'will@sawyerss.com',
          metadata: {
            booking_id: '234'
          },
          payment_status: 'paid',
          status: 'complete'
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: 'req_test',
        idempotency_key: null
      },
      type: 'checkout.session.completed'
    };

    console.log('📋 Webhook payload:');
    console.log(JSON.stringify(webhookPayload, null, 2));

    // Make a POST request to our webhook endpoint
    const serverUrl = 'http://localhost:5001/api/stripe/webhook';
    
    console.log(`\n📡 Sending webhook to: ${serverUrl}`);
    
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': 't=test,v1=test_signature' // This will fail signature validation, but that's OK for testing
      },
      body: JSON.stringify(webhookPayload)
    });

    console.log(`📤 Response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`📋 Response body: ${responseText}`);

    if (response.status === 200) {
      console.log('✅ Webhook processed successfully');
    } else {
      console.log('❌ Webhook processing failed');
    }

  } catch (error) {
    console.error('❌ Webhook test failed:', error);
    console.error('   This might be expected if the server signature verification fails');
  }
}

testWebhookTrigger().catch(console.error);
