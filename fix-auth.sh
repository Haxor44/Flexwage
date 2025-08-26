#!/bin/bash

echo "🔧 FlexWage Authentication Fix Script"
echo "====================================="

# Check if DFX is running
echo "📡 Checking DFX status..."
if ! dfx ping >/dev/null 2>&1; then
    echo "❌ DFX replica is not running!"
    echo "💡 Please start DFX with: dfx start --clean"
    exit 1
else
    echo "✅ DFX replica is running"
fi

# Check Internet Identity canister
echo "🆔 Checking Internet Identity..."
II_RESPONSE=$(curl -s "http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai" | grep -i "Internet Identity" | head -1)
if [[ -n "$II_RESPONSE" ]]; then
    echo "✅ Internet Identity is responding"
else
    echo "❌ Internet Identity is not working properly"
    echo "💡 Try: dfx deps deploy internet_identity"
fi

# Check backend canister
echo "🔗 Checking backend canister..."
BACKEND_ID=$(dfx canister id flexwage_backend 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Backend canister ID: $BACKEND_ID"
    
    # Try to call health check
    if dfx canister call flexwage_backend health_check >/dev/null 2>&1; then
        echo "✅ Backend canister is healthy"
    else
        echo "⚠️ Backend canister might have issues"
        echo "💡 Try rebuilding: dfx build && dfx deploy flexwage_backend"
    fi
else
    echo "❌ Backend canister not found"
    echo "💡 Try: dfx build && dfx deploy"
fi

# Check Next.js server
echo "🌐 Checking Next.js server..."
if curl -s "http://localhost:3000" >/dev/null 2>&1; then
    echo "✅ Next.js server is running on port 3000"
else
    echo "❌ Next.js server is not running"
    echo "💡 Start with: npm run dev"
fi

# Environment variables check
echo "🔍 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
    if grep -q "CANISTER_ID_FLEXWAGE_BACKEND" .env.local; then
        echo "✅ Backend canister ID is set in environment"
    else
        echo "⚠️ Adding backend canister ID to .env.local..."
        echo "CANISTER_ID_FLEXWAGE_BACKEND=$BACKEND_ID" >> .env.local
    fi
else
    echo "⚠️ Creating .env.local file..."
    echo "CANISTER_ID_FLEXWAGE_BACKEND=$BACKEND_ID" > .env.local
fi

echo ""
echo "🚀 Quick Fix Commands:"
echo "====================="
echo "1. If DFX issues:"
echo "   dfx stop && dfx start --clean"
echo ""
echo "2. If canister issues:"
echo "   dfx build && dfx deploy"
echo ""
echo "3. If frontend issues:"
echo "   npm install && npm run dev"
echo ""
echo "4. If still stuck, try:"
echo "   dfx stop && dfx start --clean && dfx deploy && npm run dev"
echo ""
echo "🌐 URLs to test:"
echo "==============="
echo "Frontend: http://localhost:3000"
echo "Internet Identity: http://127.0.0.1:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai"
echo "Backend Canister: http://127.0.0.1:4943/?canisterId=$BACKEND_ID"
