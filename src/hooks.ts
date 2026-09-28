import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  DealsResponse,
  ProductWithOffers,
  OfferWithHistory,
  ProductSearchResult,
  APIResponse,
} from '@shopsavvy/sdk'
import { useShopSavvyClient } from './provider'

// ── Shared hook result type ──

export interface HookResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

// ── useProductSearch ──

/**
 * Search for products by keyword query.
 *
 * Returns matching products with pagination info. Results update automatically
 * when the query string changes. Pass null or empty string to skip the request.
 *
 * @param query - Search term (e.g. "iphone 15 pro", "samsung tv")
 * @param options - Optional limit and offset for pagination
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useProductSearch('airpods pro')
 *
 * if (loading) return <ActivityIndicator />
 * if (error) return <Text>Error: {error.message}</Text>
 *
 * return data?.data.map(product => (
 *   <Text key={product.shopsavvy}>{product.title}</Text>
 * ))
 * ```
 */
export function useProductSearch(
  query: string | null,
  options?: { limit?: number; offset?: number }
): HookResult<ProductSearchResult> {
  const client = useShopSavvyClient()
  const [data, setData] = useState<ProductSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    if (!query || query.trim().length === 0) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await client.searchProducts(query, options)
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [client, query, options?.limit, options?.offset])

  useEffect(() => {
    mountedRef.current = true
    fetch()
    return () => { mountedRef.current = false }
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ── usePriceComparison ──

/**
 * Get current offers (price comparison) for a product.
 *
 * Pass any product identifier: barcode, ASIN, URL, model number, or ShopSavvy ID.
 * Returns the product with all available retailer offers sorted by price.
 *
 * @param identifier - Product identifier (barcode, ASIN, URL, model number, etc.)
 *
 * @example
 * ```tsx
 * const { data, loading, error } = usePriceComparison('B09XS7JWHH')
 *
 * if (loading) return <ActivityIndicator />
 *
 * return data?.data.map(product => (
 *   <View key={product.shopsavvy}>
 *     <Text>{product.title}</Text>
 *     {product.offers.map(offer => (
 *       <Text key={offer.id}>{offer.retailer}: ${offer.price}</Text>
 *     ))}
 *   </View>
 * ))
 * ```
 */
export function usePriceComparison(
  identifier: string | null
): HookResult<APIResponse<ProductWithOffers[]>> {
  const client = useShopSavvyClient()
  const [data, setData] = useState<APIResponse<ProductWithOffers[]> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    if (!identifier || identifier.trim().length === 0) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await client.getCurrentOffers(identifier)
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [client, identifier])

  useEffect(() => {
    mountedRef.current = true
    fetch()
    return () => { mountedRef.current = false }
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ── usePriceHistory ──

/**
 * Get price history for a product over a given number of days.
 *
 * Computes start/end dates automatically from the `days` parameter.
 * Returns historical price entries per offer (retailer).
 *
 * @param identifier - Product identifier
 * @param days - Number of days of history to fetch (default 30)
 *
 * @example
 * ```tsx
 * const { data, loading } = usePriceHistory('012345678901', 90)
 *
 * if (data) {
 *   data.data.forEach(offer => {
 *     console.log(`${offer.retailer}: ${offer.history.length} data points`)
 *   })
 * }
 * ```
 */
export function usePriceHistory(
  identifier: string | null,
  days: number = 30
): HookResult<APIResponse<OfferWithHistory[]>> {
  const client = useShopSavvyClient()
  const [data, setData] = useState<APIResponse<OfferWithHistory[]> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    if (!identifier || identifier.trim().length === 0) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const formatDate = (d: Date) => d.toISOString().split('T')[0]

      const result = await client.getPriceHistory(
        identifier,
        formatDate(startDate),
        formatDate(endDate)
      )
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [client, identifier, days])

  useEffect(() => {
    mountedRef.current = true
    fetch()
    return () => { mountedRef.current = false }
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

// ── useDeals ──

/**
 * Browse current shopping deals.
 *
 * Supports sorting, filtering by category/retailer/tag/grade, and
 * price range filters. Results include community votes and expert grades.
 *
 * Uses the client from ShopSavvyProvider, so requests carry your API key
 * and honour the provider's baseUrl and timeout.
 *
 * @param options - Optional sort, filter, and pagination parameters
 *
 * @example
 * ```tsx
 * const { data, loading } = useDeals({ sort: 'hot', limit: 20 })
 *
 * return data?.deals.map(deal => (
 *   <View key={deal.path}>
 *     <Text>{deal.grade.letter} — {deal.title}</Text>
 *     <Text>${deal.pricing.current} at {deal.retailer.name}</Text>
 *   </View>
 * ))
 * ```
 */
export function useDeals(
  options?: {
    sort?: 'hot' | 'new' | 'top-hour' | 'top-day' | 'top-week'
    limit?: number
    offset?: number
    category?: string
    retailer?: string
    tag?: string
    min_price?: number
    max_price?: number
    grade?: string
  }
): HookResult<DealsResponse> {
  const client = useShopSavvyClient()
  const [data, setData] = useState<DealsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  // Serialize options to a stable string so callers can pass an inline
  // object literal without re-fetching on every render.
  const optionsKey = JSON.stringify(options ?? {})

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await client.getDeals(JSON.parse(optionsKey))
      if (mountedRef.current) {
        setData(result)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [client, optionsKey])

  useEffect(() => {
    mountedRef.current = true
    fetch()
    return () => { mountedRef.current = false }
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
