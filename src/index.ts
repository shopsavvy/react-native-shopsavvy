/**
 * react-native-shopsavvy
 *
 * React Native hooks and provider for the ShopSavvy Data API.
 * Provides useProductSearch, usePriceComparison, usePriceHistory,
 * and useDeals hooks that return { data, loading, error } patterns.
 *
 * @see https://shopsavvy.com/data
 */

export { ShopSavvyProvider, useShopSavvyClient } from './provider'
export type { ShopSavvyProviderProps } from './provider'

export {
  useProductSearch,
  usePriceComparison,
  usePriceHistory,
  useDeals,
} from './hooks'
export type { HookResult } from './hooks'

// Re-export SDK types for convenience
export type {
  ShopSavvyConfig,
  ProductDetails,
  ProductWithOffers,
  Offer,
  OfferWithHistory,
  PriceHistoryEntry,
  ProductSearchResult,
  APIResponse,
  APIMeta,
  PaginationInfo,
  Deal,
  DealsResponse,
} from '@shopsavvy/sdk'
