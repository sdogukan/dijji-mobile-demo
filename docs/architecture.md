# Architecture

_A field marked **Repos:** applies only to those repositories; a field without the line is project-wide._

## TL;DR

### TL;DR

**Repos:** dijji-mobile-demo

One service: a single React Native JS bundle (App.tsx) hosted by thin Android (Kotlin) and iOS (Swift) shells.
No backend, no database, no cache, no network calls.
Auth is a client-side comparison against a hardcoded demo credential.
Navigation is plain React state (a discriminated `Screen` union) — no navigation library.
Every interactive element has a testID + accessibilityLabel for Maestro E2E flows.

_Derived from App.tsx header comment and README ('no backend, no navigation library')._

## System Flow Diagram

### Flow: Sign in (SCR-signin)

**Repos:** dijji-mobile-demo

1. App starts on the Sign in screen.
2. User types username and password.
3. User taps "Sign in".
4. Empty username (after trim) or empty password -> error "Enter your username and password."
5. Credentials not equal to demo / demo1234 -> error "Wrong username or password."
6. Correct credentials -> error cleared, user stored in memory, Products screen shown.

_SignInScreen.submit; username is trimmed, password is compared verbatim._

### Flow: Browse products and open detail (SCR-products, SCR-detail)

**Repos:** dijji-mobile-demo

1. Products screen shows "Welcome, <user>" and 3 products (Espresso 45 TL, Flat White 65 TL, Cold Brew 70 TL).
2. User taps a product card.
3. Detail screen shows the product name, description, quantity 1 and total = price.
4. User taps "‹ Back" -> Products screen (quantity is not kept).

_Conflict: ProductsScreen now holds a `query` state and renders `PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))`; when the result is empty the FlatList is replaced by an `empty_text` message ("No products match"). Step 1 of the committed flow therefore holds only for an empty query, and the flow records no search step. A flow is an intent decision, so the existing value is kept unchanged until the user chooses. Note: qa `Coverage targets` states "E2E: all 4 flows" — option 2 makes that 5._

### Flow: Adjust quantity and see total (SCR-detail)

**Repos:** dijji-mobile-demo

1. Quantity starts at 1.
2. "+" increments quantity by 1 (no upper bound).
3. "−" decrements quantity by 1, floored at 1.
4. "Total: <price × quantity> TL" updates on every change.

_setQuantity(q => Math.max(1, q - 1)) / setQuantity(q => q + 1); total_text renders product.price * quantity._

### Flow: Sign out (SCR-products)

**Repos:** dijji-mobile-demo

1. User taps "Sign out" on the Products screen.
2. In-memory user is cleared.
3. Sign in screen is shown with empty fields.

_Root onSignOut: setUser(null), setScreen({name: 'signin'}); SignInScreen remounts so its inputs reset._

## Service Topology

### Services

**Repos:** dijji-mobile-demo

- Mobile app (JS bundle, App.tsx) — all screens, navigation state, product catalog and demo sign-in
- Android host (MainActivity, MainApplication) — boots React Native with New Architecture + Hermes
- iOS host (AppDelegate) — boots React Native via RCTReactNativeFactory; loads main.jsbundle in release

_Native hosts are unmodified React Native template entry points registering module name DijjiMobileDemo._

### Database tables

**Repos:** dijji-mobile-demo

- None — product catalog is the in-code PRODUCTS constant; session is in-memory React state

_No persistence layer exists._

### Connection diagram

**Repos:** dijji-mobile-demo

```
+---------------------------+      +---------------------------+
| Android host (Kotlin)     |      | iOS host (Swift)          |
| MainActivity/MainApp      |      | AppDelegate               |
+-------------+-------------+      +-------------+-------------+
              |                                  |
              +---------------+------------------+
                              v
               +-----------------------------+
               | JS bundle: App.tsx          |
               |  Root (Screen state)        |
               |  SignIn / Products / Detail |
               |  PRODUCTS, DEMO_USER consts |
               +-----------------------------+
                              ^
                              | UI automation (testID / a11y label)
               +-----------------------------+
               | Maestro via dijji CLI       |
               | (emulator / simulator)      |
               +-----------------------------+
(no outbound network connections)
```

_Maestro drives the app only during DIJJI's mobile gate (README)._

## Database Design

### Product (in-memory constant)

**Repos:** dijji-mobile-demo

| PK | SK | Type | Attributes |
| --- | --- | --- | --- |
| id (p1, p2, p3) | — | Product | name: string, price: number (TL, integer), description: string |

_type Product and export const PRODUCTS in App.tsx; not a database table._

### Session state (in-memory)

**Repos:** dijji-mobile-demo

| PK | SK | Type | Attributes |
| --- | --- | --- | --- |
| — | — | Screen | name: signin \| products \| detail (+ product on detail) |
| — | — | User | string \| null (signed-in username) |
| — | — | Quantity | number >= 1 (local to DetailScreen) |

_useState hooks in Root and DetailScreen._

### GSIs

**Repos:** dijji-mobile-demo

| GSI name | PK | SK | Purpose |
| --- | --- | --- | --- |
| None | — | — | No database; the 3-item list is rendered directly |

_No persistence layer._

### TTL

**Repos:** dijji-mobile-demo

| Type | Duration | Field |
| --- | --- | --- |
| Signed-in session | Until sign out or app process ends | user (React state) |

_No expiry logic exists; state is lost on process restart._

## API Endpoint List

### API Endpoint List

**Repos:** dijji-mobile-demo

| Method | Path | Description | Auth required |
| --- | --- | --- | --- |
| — | — | None — no network API is called | — |

_No fetch/XHR usage in App.tsx or index.js._

## Cache Strategy

### Cache layers

**Repos:** dijji-mobile-demo

None

_No remote data to cache._

## Security Checklist

### Security Checklist

**Repos:** dijji-mobile-demo

| Control | Implementation |
| --- | --- |
| Brute force | None — unlimited sign-in attempts |
| Email enumeration | N/A — no email; same screen shows a generic 'Wrong username or password.' |
| Password hashing | None — plaintext DEMO_USER constant in the JS bundle |
| JWT secret | N/A — no tokens |
| Token rotation | N/A — no tokens |
| Reset / verify token | N/A — no password reset or verification |
| CSRF + XSS | N/A — no web views or network requests |
| Rate limiting | None |
| Transport | No network calls; iOS ATS left at template default (NSAllowsArbitraryLoads false) |
| Release signing | Android release signed with the template debug keystore (emulator-only) |

_Current state read from App.tsx, ios/DijjiMobileDemo/Info.plist and android/app/build.gradle._

### Security posture (intent)

**Repos:** dijji-mobile-demo

Demo-only: never published to app stores, no real user data; hardcoded credentials and debug-keystore signing are accepted

_README describes the app as a demo for DIJJI's mobile E2E flow; the demo-only posture (no store distribution, no real user data) is a user-approved decision._

## ADRs

### ADRs

**Repos:** dijji-mobile-demo

- ADR-001: Screen navigation — plain React state (discriminated Screen union) instead of a navigation library, so the app builds with only the RN template
- ADR-002: Data — no backend; catalog and demo credentials are in-code constants
- ADR-003: E2E builds — release builds with the embedded JS bundle, so the app runs without a Metro dev server
- ADR-004: Testability — every interactive element carries a testID and an accessibilityLabel for Maestro selection
- ADR-005: Runtime — React Native New Architecture + Hermes enabled

_ADR-001/002/004 from the App.tsx header comment; ADR-003 from README; ADR-005 from android/gradle.properties._
