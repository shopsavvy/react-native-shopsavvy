#!/bin/bash
set -e

echo "=== react-native-shopsavvy test ==="

echo "1. Checking TypeScript compilation..."
npx tsc --noEmit
echo "   PASS: TypeScript compiles without errors"

echo "2. Verifying exports..."
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/index.ts', 'utf8');
const required = ['ShopSavvyProvider', 'useProductSearch', 'usePriceComparison', 'usePriceHistory', 'useDeals'];
const missing = required.filter(name => !src.includes(name));
if (missing.length > 0) {
  console.error('Missing exports:', missing.join(', '));
  process.exit(1);
}
console.log('   PASS: All expected exports found');
"

echo "3. Verifying provider context..."
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/provider.tsx', 'utf8');
if (!src.includes('createContext')) { console.error('Missing createContext'); process.exit(1); }
if (!src.includes('ShopSavvyDataAPI')) { console.error('Missing ShopSavvyDataAPI usage'); process.exit(1); }
if (!src.includes('useContext')) { console.error('Missing useContext'); process.exit(1); }
console.log('   PASS: Provider uses React context correctly');
"

echo "4. Verifying hook patterns..."
node -e "
const fs = require('fs');
const src = fs.readFileSync('src/hooks.ts', 'utf8');
const hooks = ['useProductSearch', 'usePriceComparison', 'usePriceHistory', 'useDeals'];
for (const hook of hooks) {
  if (!src.includes('export function ' + hook)) {
    console.error('Missing hook:', hook);
    process.exit(1);
  }
}
// Verify { data, loading, error } pattern
if (!src.includes('data,') || !src.includes('loading,') || !src.includes('error,')) {
  console.error('Hooks do not return { data, loading, error } pattern');
  process.exit(1);
}
console.log('   PASS: All hooks present with correct return pattern');
"

echo "5. Checking required files..."
for f in LICENSE README.md package.json tsconfig.json .gitignore src/index.ts src/provider.tsx src/hooks.ts; do
  if [ ! -f "$f" ]; then
    echo "   FAIL: Missing $f"
    exit 1
  fi
done
echo "   PASS: All required files present"

echo ""
echo "All tests passed!"
