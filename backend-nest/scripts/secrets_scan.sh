#!/usr/bin/env bash
set -e
mkdir -p artifacts
if ! command -v gitleaks >/dev/null 2>&1; then
  curl -sSL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_$(uname -s | tr '[:upper:]' '[:lower:]')_x64.tar.gz -L | tar xz
  GITLEAKS=./gitleaks
else GITLEAKS=gitleaks; fi
$GITLEAKS detect --no-git --redact --report-format sarif --report-path artifacts/gitleaks.sarif --source .
