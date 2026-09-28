# react-native-shopsavvy

[![npm version](https://img.shields.io/npm/v/react-native-shopsavvy.svg)](https://www.npmjs.com/package/react-native-shopsavvy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React Native hooks for the [ShopSavvy Data API](https://shopsavvy.com/data). Product search, price comparison, price history, and deal discovery with a simple `{ data, loading, error }` pattern.

[Documentation](https://shopsavvy.com/integrations/react-native) · [Get an API key](https://shopsavvy.com/data) · [Other integrations](https://shopsavvy.com/integrations)

## Installation

```bash
npm install react-native-shopsavvy
```

Pure JavaScript: no native modules, no linking, no `pod install`. Works in bare React Native and Expo (including Expo Go).

## Quick Start

Wrap your app with `ShopSavvyProvider`, then use any hook:

```tsx
import { ActivityIndicator, FlatList, Text } from 'react-native'
import { ShopSavvyProvider, useProductSearch } from 'react-native-shopsavvy'

// 1. Wrap your app
export default function App() {
  return (
    <ShopSavvyProvider apiKey="ss_live_your_api_key_here">
      <ProductScreen />
    </ShopSavvyProvider>
  )
}

// 2. Use hooks in any child component
function ProductScreen() {
  const { data, loading, error } = useProductSearch('airpods pro')

  if (loading) return <ActivityIndicator />
  if (error) return <Text>Error: {error.message}</Text>

  return (
    <FlatList
      data={data?.data ?? []}
      keyExtractor={item => item.shopsavvy}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  )
}
```

Get your API key at [shopsavvy.com/data](https://shopsavvy.com/data).

> Your API key ships inside your app bundle. For production apps, consider routing requests through your own backend and pointing `baseUrl` at it.

## Hooks

### `useProductSearch(query, options?)`

Search for products by keyword. Pass `null` or an empty string to skip the request.

```tsx
const { data, loading, error, refetch } = useProductSearch('samsung tv', { limit: 10 })

// data.data => [{ title: '...', shopsavvy: '...', brand: '...', ... }, ...]
```

### `usePriceComparison(identifier)`

Get current offers across retailers for a product. Accepts a barcode, ASIN, URL, model number, or ShopSavvy ID.

```tsx
const { data, loading, error } = usePriceComparison('B09XS7JWHH')

// data.data[0].offers => [{ retailer: 'Amazon', price: 199.99, ... }, ...]
```

### `usePriceHistory(identifier, days?)`

Get historical prices for the last `days` days (default 30).

```tsx
const { data, loading, error } = usePriceHistory('012345678901', 90)

// data.data => one entry per product: [{ title, shopsavvy, offers: [{ retailer: 'Amazon', history: [{ timestamp, price, currency, availability }, ...] }, ...] }]
// history is newest first; a point's currency is null when none was recorded
```

### `useDeals(options?)`

Browse current shopping deals with sorting, filtering, and pagination.

```tsx
const { data, loading, error } = useDeals({
  sort: 'hot',            // 'hot' | 'new' | 'top-hour' | 'top-day' | 'top-week'
  limit: 20,
  category: 'electronics',
  grade: 'B'
})

// data.deals => [{ title: '...', grade: { letter: 'A', ... }, pricing: { current: 29.99, ... } }, ...]
```

Other filters: `offset`, `retailer`, `tag`, `min_price`, `max_price`.

## Hook Return Type

Every hook returns:

```typescript
{
  data: T | null       // API response data (null before first load)
  loading: boolean     // true while request is in flight
  error: Error | null  // error object if request failed
  refetch: () => void  // manually trigger a new request
}
```

## Provider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiKey` | `string` | Yes | Your ShopSavvy API key |
| `baseUrl` | `string` | No | Custom API base URL (e.g. your own proxy) |
| `timeout` | `number` | No | Request timeout in ms |

`useShopSavvyClient()` returns the underlying [`@shopsavvy/sdk`](https://www.npmjs.com/package/@shopsavvy/sdk) client if you need an endpoint the hooks don't cover.

## Requirements

- React >= 17.0.0
- React Native >= 0.70.0

## Development

```bash
bun install
bun run typecheck
bun run build
bun test
```

## License

MIT
