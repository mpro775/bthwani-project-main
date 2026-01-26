#!/bin/bash
# BTW-AUD-001: Generate Typed API Clients from OpenAPI
# Generates TypeScript clients for admin-dashboard, bthwani-web, and app-user

set -e

echo "🔧 BThwani Typed Client Generator - BTW-AUD-001"
echo "=============================================="
echo ""

# Ensure OpenAPI spec exists
if [ ! -f "reports/openapi.json" ]; then
    echo "📝 Generating OpenAPI spec..."
    npm run audit:openapi
fi

# Install openapi-typescript-codegen if not available
if ! command -v openapi-generator-cli &> /dev/null; then
    echo "📥 Installing OpenAPI Generator..."
    npm install -g @openapitools/openapi-generator-cli
fi

echo "✅ OpenAPI spec found: reports/openapi.json"
echo ""

# Generate client for admin-dashboard
echo "📦 Generating client for admin-dashboard..."
npx openapi-typescript-codegen --input reports/openapi.json \
    --output ../admin-dashboard/src/api/generated \
    --client axios \
    --useOptions \
    --useUnionTypes \
    --exportCore true \
    --exportServices true \
    --exportModels true

echo "✅ Admin dashboard client generated"
echo ""

# Generate client for bthwani-web
echo "📦 Generating client for bthwani-web..."
npx openapi-typescript-codegen --input reports/openapi.json \
    --output ../bthwani-web/src/api/generated \
    --client axios \
    --useOptions \
    --useUnionTypes \
    --exportCore true \
    --exportServices true \
    --exportModels true

echo "✅ Web client generated"
echo ""

# Generate client for app-user (React Native compatible)
echo "📦 Generating client for app-user..."
npx openapi-typescript-codegen --input reports/openapi.json \
    --output ../app-user/src/api/generated \
    --client axios \
    --useOptions \
    --useUnionTypes \
    --exportCore true \
    --exportServices true \
    --exportModels true

echo "✅ App user client generated"
echo ""

echo "✅ All typed clients generated successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Review generated clients in src/api/generated/"
echo "   2. Replace raw axios calls with typed service calls"
echo "   3. Update imports to use generated types"
echo "   4. Run tests to verify integration"
echo ""
echo "💡 Usage example:"
echo "   import { UsersService } from '@/api/generated';"
echo "   const users = await UsersService.getUsers();"
echo ""

