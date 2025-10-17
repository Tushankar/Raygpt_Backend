#!/bin/bash
# Run this script on your production server to check Firebase environment variables

echo "======================================"
echo "FIREBASE CREDENTIALS CHECK"
echo "======================================"
echo ""

echo "Checking required Firebase environment variables..."
echo ""

# Required Firebase variables
REQUIRED_VARS=(
  "FIREBASE_PROJECT_ID"
  "FIREBASE_PRIVATE_KEY"
  "FIREBASE_CLIENT_EMAIL"
)

# Optional but recommended
OPTIONAL_VARS=(
  "FIREBASE_PRIVATE_KEY_ID"
  "FIREBASE_CLIENT_ID"
)

MISSING=0

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ MISSING: $var"
    MISSING=$((MISSING + 1))
  else
    # Show first 20 chars only (don't expose secrets)
    VALUE="${!var}"
    if [ ${#VALUE} -gt 20 ]; then
      PREVIEW="${VALUE:0:20}..."
    else
      PREVIEW="${VALUE}"
    fi
    echo "✅ SET: $var = ${PREVIEW}"
  fi
done

echo ""
echo "Optional variables:"
for var in "${OPTIONAL_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  NOT SET: $var (optional)"
  else
    echo "✅ SET: $var"
  fi
done

echo ""
echo "======================================"
if [ $MISSING -eq 0 ]; then
  echo "✅ All required Firebase variables are set!"
else
  echo "❌ $MISSING required variable(s) missing!"
  echo ""
  echo "TO FIX:"
  echo "1. Create a .env file in /root/rayone/ with the missing variables"
  echo "2. Or set them in your PM2 ecosystem.config.js"
  echo "3. Restart PM2: pm2 restart rayone"
fi
echo "======================================"
