#!/bin/bash

# Script to check OpenAI API rate limits via curl (shows headers)

echo "🔍 Checking OpenAI API Rate Limits via curl"
echo "============================================================\n"

# Load API key from .env file
if [ -f "jamie-backend/.env" ]; then
    export $(grep -v '^#' jamie-backend/.env | xargs)
else
    echo "❌ Error: jamie-backend/.env file not found"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY not found in .env file"
    exit 1
fi

echo "Making test API call to check rate limit headers...\n"

# Make API call and show headers
curl -s -i -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Say test"}],
    "max_tokens": 10
  }' | head -50

echo "\n============================================================\n"
echo "📊 Look for these headers in the output above:"
echo "   • x-ratelimit-limit-tokens (your TPM limit)"
echo "   • x-ratelimit-limit-requests (your RPM limit)"
echo "   • x-ratelimit-remaining-tokens"
echo "   • x-ratelimit-remaining-requests\n"

echo "🎯 Expected Tier 2 limits:"
echo "   • TPM: 40,000 - 80,000+"
echo "   • RPM: 1,000 - 3,000+"
echo "\n⚠️  If TPM < 100,000, you may need to request a manual increase"
echo "   for 40+ concurrent users (need ~150,000 TPM)\n"

