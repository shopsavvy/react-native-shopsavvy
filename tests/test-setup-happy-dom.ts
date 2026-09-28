// Gives bun:test a DOM so @testing-library/react can render hooks.
// The hooks themselves use no DOM or react-native APIs — only React and fetch.
import { GlobalRegistrator } from '@happy-dom/global-registrator'

// happy-dom replaces the fetch family with its own CORS-enforcing
// implementations. The hooks run on React Native's fetch in production, so keep
// the runtime's native fetch and the types it expects (its signal must be a
// native AbortSignal).
const native = {
  fetch: globalThis.fetch,
  Headers: globalThis.Headers,
  Request: globalThis.Request,
  Response: globalThis.Response,
  AbortController: globalThis.AbortController,
  AbortSignal: globalThis.AbortSignal,
}
GlobalRegistrator.register()
Object.assign(globalThis, native)
