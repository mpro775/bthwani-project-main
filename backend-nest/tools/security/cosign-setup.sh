#!/bin/bash
# BTW-SEC-003: Cosign setup for artifact signing
# This script sets up cosign for signing artifacts and SBOM

set -e

echo "🔐 BThwani Cosign Setup - BTW-SEC-003"
echo "====================================="
echo ""

# Check if cosign is installed
if ! command -v cosign &> /dev/null; then
    echo "📥 Installing cosign..."
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -Lo cosign https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64
        chmod +x cosign
        sudo mv cosign /usr/local/bin/
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install cosign
    else
        echo "❌ Please install cosign manually from: https://github.com/sigstore/cosign"
        exit 1
    fi
fi

echo "✅ Cosign is installed: $(cosign version 2>&1 | head -1)"
echo ""

# Check if keys exist
if [ ! -f "cosign.key" ]; then
    echo "🔑 Generating cosign key pair..."
    echo "⚠️  You will be prompted to set a password for the private key"
    cosign generate-key-pair
    
    echo ""
    echo "✅ Key pair generated:"
    echo "   - Private key: cosign.key (⚠️  KEEP THIS SECRET!)"
    echo "   - Public key: cosign.pub"
    echo ""
    echo "⚠️  IMPORTANT: Add cosign.key to .gitignore and store securely in Vault!"
else
    echo "✅ Cosign keys already exist"
fi

# Create .gitignore entry if needed
if ! grep -q "cosign.key" ../.gitignore 2>/dev/null; then
    echo "cosign.key" >> ../../.gitignore
    echo "✅ Added cosign.key to .gitignore"
fi

echo ""
echo "📦 Signing SBOM files..."

# Sign SBOM files if they exist
if [ -f "../../reports/sbom.json" ]; then
    cosign sign-blob --key cosign.key ../../reports/sbom.json > ../../reports/sbom.json.sig
    echo "✅ Signed: reports/sbom.json"
fi

if [ -f "../../reports/sbom-cyclonedx.json" ]; then
    cosign sign-blob --key cosign.key ../../reports/sbom-cyclonedx.json > ../../reports/sbom-cyclonedx.json.sig
    echo "✅ Signed: reports/sbom-cyclonedx.json"
fi

echo ""
echo "✅ Cosign setup completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Store cosign.key in HashiCorp Vault or AWS Secrets Manager"
echo "   2. Set up CI/CD to sign all Docker images and artifacts"
echo "   3. Configure verification in deployment pipeline"
echo ""
echo "📚 Usage examples:"
echo "   - Sign a file: cosign sign-blob --key cosign.key <file>"
echo "   - Verify signature: cosign verify-blob --key cosign.pub --signature <file>.sig <file>"
echo "   - Sign Docker image: cosign sign --key cosign.key <image>:<tag>"
echo ""

