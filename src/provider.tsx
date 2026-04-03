import React, { createContext, useContext, useMemo } from 'react'
import { ShopSavvyDataAPI, type ShopSavvyConfig } from '@shopsavvy/sdk'

interface ShopSavvyContextValue {
  client: ShopSavvyDataAPI
}

const ShopSavvyContext = createContext<ShopSavvyContextValue | null>(null)

/**
 * Props for ShopSavvyProvider
 */
export interface ShopSavvyProviderProps {
  /** Your ShopSavvy API key (get one at https://shopsavvy.com/data) */
  apiKey: string
  /** Optional base URL override */
  baseUrl?: string
  /** Optional request timeout in milliseconds */
  timeout?: number
  children: React.ReactNode
}

/**
 * Context provider that supplies a ShopSavvy API client to all child hooks.
 *
 * Wrap your app (or a subtree) with this provider to enable useProductSearch,
 * usePriceComparison, usePriceHistory, and useDeals hooks.
 *
 * @example
 * ```tsx
 * import { ShopSavvyProvider } from 'react-native-shopsavvy'
 *
 * export default function App() {
 *   return (
 *     <ShopSavvyProvider apiKey="ss_live_your_api_key_here">
 *       <YourApp />
 *     </ShopSavvyProvider>
 *   )
 * }
 * ```
 */
export function ShopSavvyProvider({ apiKey, baseUrl, timeout, children }: ShopSavvyProviderProps) {
  const client = useMemo(() => {
    const config: ShopSavvyConfig = { apiKey }
    if (baseUrl) config.baseUrl = baseUrl
    if (timeout) config.timeout = timeout
    return new ShopSavvyDataAPI(config)
  }, [apiKey, baseUrl, timeout])

  const value = useMemo(() => ({ client }), [client])

  return (
    <ShopSavvyContext.Provider value={value}>
      {children}
    </ShopSavvyContext.Provider>
  )
}

/**
 * Internal hook to access the ShopSavvy client from context.
 * Throws if used outside of a ShopSavvyProvider.
 */
export function useShopSavvyClient(): ShopSavvyDataAPI {
  const context = useContext(ShopSavvyContext)
  if (!context) {
    throw new Error(
      'useShopSavvyClient must be used within a <ShopSavvyProvider>. ' +
      'Wrap your component tree with <ShopSavvyProvider apiKey="...">.'
    )
  }
  return context.client
}
