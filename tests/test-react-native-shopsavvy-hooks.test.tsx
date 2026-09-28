import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import {
  ShopSavvyProvider,
  useDeals,
  usePriceComparison,
  usePriceHistory,
  useProductSearch,
  useShopSavvyClient,
} from '../src/index'
import { FIXTURE_API_KEY, startDataApiServer } from './test-fixture-data-api-server'

let api: ReturnType<typeof startDataApiServer>

beforeAll(() => {
  api = startDataApiServer()
})

afterAll(() => {
  api.stop()
})

function wrapperFor(apiKey: string) {
  return ({ children }: { children: React.ReactNode }) => (
    <ShopSavvyProvider apiKey={apiKey} baseUrl={api.baseUrl}>
      {children}
    </ShopSavvyProvider>
  )
}

const wrapper = wrapperFor(FIXTURE_API_KEY)

function lastRequestTo(path: string) {
  const matches = api.requests.filter((r) => r.path === path)
  return matches[matches.length - 1]
}

describe('ShopSavvyProvider', () => {
  test('hooks used outside the provider throw a helpful error', () => {
    const originalError = console.error
    console.error = () => {}
    try {
      expect(() => renderHook(() => useShopSavvyClient())).toThrow(/must be used within a <ShopSavvyProvider>/)
    } finally {
      console.error = originalError
    }
  })
})

describe('useProductSearch', () => {
  test('searches with q/limit/offset and exposes the result', async () => {
    const { result } = renderHook(() => useProductSearch('airpods pro', { limit: 5, offset: 10 }), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
    expect(result.current.data?.data[0].title).toBe('Apple AirPods Pro (2nd Generation)')
    const req = lastRequestTo('/v1/products/search')
    expect(req.authorization).toBe(`Bearer ${FIXTURE_API_KEY}`)
    expect(req.params).toMatchObject({ q: 'airpods pro', limit: '5', offset: '10' })
  })

  test('an empty query makes no request and returns null data', async () => {
    const before = api.requests.length
    const { result } = renderHook(() => useProductSearch('   '), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(api.requests.length).toBe(before)
  })
})

describe('usePriceComparison', () => {
  test('fetches current offers by identifier', async () => {
    const { result } = renderHook(() => usePriceComparison('0194253397137'), { wrapper })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    expect(result.current.data?.data[0].offers.map((o) => o.retailer)).toEqual(['Amazon', 'Best Buy'])
    expect(lastRequestTo('/v1/products/offers').params).toMatchObject({ ids: '0194253397137' })
  })

  test('an API error is surfaced on error, not swallowed', async () => {
    const { result } = renderHook(() => usePriceComparison('0194253397137'), { wrapper: wrapperFor('ss_live_wrongkey456') })
    await waitFor(() => expect(result.current.error).not.toBeNull())
    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})

describe('usePriceHistory', () => {
  test('requests start/end spanning the requested number of days, ending today', async () => {
    const { result } = renderHook(() => usePriceHistory('0194253397137', 90), { wrapper })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    // products -> offers -> history, as the Data API returns it
    const product = result.current.data!.data[0]
    expect(product.shopsavvy).toBe('ss-airpods-pro-2')
    expect(product.offers.map((o) => o.retailer)).toEqual(['Amazon', 'eBay'])
    expect(product.offers[0].history.map((h) => [h.timestamp, h.price, h.currency])).toEqual([
      ['2026-08-15T00:00:00Z', 189.99, 'USD'],
      ['2026-08-01T00:00:00Z', 249.0, null],
    ])
    expect(product.offers[1].history).toEqual([])

    const { params } = lastRequestTo('/v1/products/offers/history')
    expect(params.ids).toBe('0194253397137')
    const today = new Date().toISOString().split('T')[0]
    expect(params.end).toBe(today)
    const spanDays = (Date.parse(params.end) - Date.parse(params.start)) / 86_400_000
    expect(spanDays).toBe(90)
  })
})

describe('useDeals', () => {
  test('sends the API key and filters, and returns the deals payload', async () => {
    const { result } = renderHook(
      () => useDeals({ sort: 'top-day', limit: 20, category: 'electronics', grade: 'B' }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.data).not.toBeNull())
    expect(result.current.error).toBeNull()
    expect(result.current.data?.deals[0].grade.letter).toBe('A')

    const req = lastRequestTo('/v1/deals')
    expect(req.authorization).toBe(`Bearer ${FIXTURE_API_KEY}`)
    expect(req.params).toMatchObject({ sort: 'top-day', limit: '20', category: 'electronics', grade: 'B' })
  })

  test('an inline options object does not refetch on every render', async () => {
    const { result, rerender } = renderHook(() => useDeals({ sort: 'hot' }), { wrapper })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    const count = api.requests.filter((r) => r.path === '/v1/deals').length
    rerender()
    rerender()
    await new Promise((r) => setTimeout(r, 50))
    expect(api.requests.filter((r) => r.path === '/v1/deals').length).toBe(count)
  })

  test('refetch issues a new request', async () => {
    const { result } = renderHook(() => useDeals(), { wrapper })
    await waitFor(() => expect(result.current.data).not.toBeNull())
    const count = api.requests.filter((r) => r.path === '/v1/deals').length
    await act(async () => {
      await result.current.refetch()
    })
    expect(api.requests.filter((r) => r.path === '/v1/deals').length).toBe(count + 1)
  })
})
