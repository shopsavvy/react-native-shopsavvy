#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

echo "=== react-native-shopsavvy tests ==="

echo "==> bun install"
bun install

echo "==> typecheck"
bun run typecheck

echo "==> build"
bun run build
for f in dist/index.js dist/index.mjs dist/index.d.ts dist/index.d.mts; do
  [ -f "$f" ] || { echo "ERROR: build artifact missing: $f"; exit 1; }
done

echo "==> bun test"
bun test

echo "All tests passed!"
