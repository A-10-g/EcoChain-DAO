#!/bin/bash
# EcoChain DAO Quick Fix Script
# This script will fix your authentication issues

echo "🔧 Starting EcoChain DAO Fix..."

# Step 1: Stop dfx
echo "1. Stopping dfx..."
dfx stop 2>/dev/null || true

# Step 2: Clean up
echo "2. Cleaning up old files..."
rm -rf .dfx node_modules

# Step 3: Install dependencies
echo "3. Installing dependencies..."
npm install

# Step 5: Start fresh
echo "5. Starting fresh dfx..."
dfx start --clean --background

# Step 6: Deploy
echo "6. Deploying canisters..."
dfx deploy

# Step 7: Generate
echo "7. Generating interfaces..."
dfx generate


echo "Your EcoChain DAO should now work. Open the frontend URL that was displayed above."
