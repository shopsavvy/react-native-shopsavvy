# react-native-shopsavvy

[![npm version](https://badge.fury.io/js/react-native-shopsavvy.svg)](https://badge.fury.io/js/react-native-shopsavvy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

React Native hooks for the [ShopSavvy Data API](https://shopsavvy.com/data). Product search, price comparison, price history, and deal discovery with a simple `{ data, loading, error }` pattern.

## Installation

```bash
npm install react-native-shopsavvy @shopsavvy/sdk
```

## Quick Start

Wrap your app with `ShopSavvyProvider`, then use any hook:

```tsx
import { ShopSavvyProvider, useProductSearch, usePriceComparison, useDeals } from 'react-native-shopsavvy'

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

## Hooks

### `useProductSearch(query, options?)`

Search for products by keyword.

```tsx
const { data, loading, error, refetch } = useProductSearch('samsung tv', { limit: 10 })
```

### `usePriceComparison(identifier)`

Get current offers across retailers for a product.

```tsx
const { data, loading, error } = usePriceComparison('B09XS7JWHH')

// data.data[0].offers => [{ retailer: 'Amazon', price: 199.99, ... }, ...]
```

### `usePriceHistory(identifier, days?)`

Get historical price data. Defaults to 30 days.

```tsx
const { data, loading, error } = usePriceHistory('012345678901', 90)

// data.data => [{ retailer: 'Amazon', price_history: [...] }, ...]
```

### `useDeals(options?)`

Browse current shopping deals with sorting, filtering, and pagination.

```tsx
const { data, loading, error } = useDeals({
  sort: 'hot',
  limit: 20,
  category: 'electronics',
  grade: 'B'
})

// data.deals => [{ title: '...', grade: { letter: 'A', ... }, pricing: { current: 29.99, ... } }, ...]
```

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
| `baseUrl` | `string` | No | Custom API base URL |
| `timeout` | `number` | No | Request timeout in ms |

## Requirements

- React >= 17.0.0
- React Native >= 0.70.0

## License

MIT
