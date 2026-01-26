#!/usr/bin/env bash
set -e
mkdir -p artifacts
ALLOW='(httpClient|apiClient|typedClient)'
BAD=$(git ls-files '*.[tj]s*' | xargs -I{} grep -nH -E '\b(fetch\(|axios\.)' {} | grep -v -E "$ALLOW" || true)
echo "$BAD" > artifacts/grep_raw_fetch.txt
if [ -n "$BAD" ]; then echo 'Raw fetch/axios detected'; exit 1; fi
