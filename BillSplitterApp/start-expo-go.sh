#!/bin/bash

echo "🚀 Starting Bill Splitter App for Expo Go..."
echo "📱 This version is compatible with Expo Go and includes:"
echo "   ✅ Multi-currency bill splitting"
echo "   ✅ Dark mode support"
echo "   ✅ Bill history and analytics"
echo "   ✅ Custom split percentages"
echo "   ✅ Simulated camera & voice features"
echo ""

cd /workspaces/billapp/BillSplitterApp

# Clear any existing processes
pkill -f "expo" || true

# Start Expo development server
echo "Starting Expo development server..."
npx expo start --clear
