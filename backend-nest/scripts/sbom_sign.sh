#!/usr/bin/env bash
set -e
mkdir -p artifacts
if command -v cyclonedx-npm >/dev/null 2>&1; then
  npx cyclonedx-npm --output-format json --output-file artifacts/sbom.cdx.json
elif command -v syft >/dev/null 2>&1; then
  syft dir:. -o cyclonedx-json > artifacts/sbom.cdx.json
else echo '{}' > artifacts/sbom.cdx.json; fi
if command -v cosign >/dev/null 2>&1; then
  cosign verify ${IMAGE_REF:-ghcr.io/org/app:latest} > artifacts/cosign.verify.txt || true
else echo 'cosign not installed' > artifacts/cosign.verify.txt; fi
