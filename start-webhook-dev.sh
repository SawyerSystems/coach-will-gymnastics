#!/bin/bash

# Start Stripe webhook forwarding for development
# This will forward webhooks to your local development server

echo "🚀 Starting Stripe webhook forwarding for development..."
echo "This will forward webhooks to localhost:5001/api/stripe/webhook"
echo ""
echo "🔧 Make sure your development server is running on port 5001"
echo "   npm run dev"
echo ""
echo "📝 Copy the webhook secret that appears below and update your .env:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "🛑 Press Ctrl+C to stop forwarding"
echo ""

# Forward webhooks to local development server
stripe listen --forward-to localhost:5001/api/stripe/webhook
