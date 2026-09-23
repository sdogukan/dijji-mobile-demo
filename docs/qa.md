# QA

_A field marked **Repos:** applies only to those repositories; a field without the line is project-wide._

## Test Strategy

### Test levels

**Repos:** dijji-mobile-demo

- Unit / render — Jest (@react-native/jest-preset) + react-test-renderer, currently 1 test
- E2E — Maestro flows run on emulator/simulator by the dijji CLI at the DIJJI mobile gate
- Integration dropped — no backend or modules to integrate; E2E covers every screen path

___tests__/App.test.tsx and jest.config.js; README 'How DIJJI uses this repository'._

### Coverage targets

**Repos:** dijji-mobile-demo

- Unit: no % target; sign-in validation and quantity/total logic covered
- E2E: all 4 flows (sign in, browse/open detail, quantity/total, sign out)
- Lighthouse: N/A (native mobile app)

_User-approved targets; no coverage threshold is configured in jest.config.js or package.json._

## Test Case List

### E2E scenarios

**Repos:** dijji-mobile-demo

| # | Scenario | Steps |
| --- | --- | --- |
| 1 | Sign in — success | Enter demo / demo1234 -> tap signin_button -> products_screen visible, welcome_text = 'Welcome, demo' |
| 2 | Sign in — empty fields | Tap signin_button with empty inputs -> signin_error 'Enter your username and password.' |
| 3 | Sign in — wrong password | Enter demo / wrong -> tap signin_button -> signin_error 'Wrong username or password.' |
| 4 | Browse and open detail | Sign in -> tap product_p2 -> detail_title 'Flat White', total_text 'Total: 65 TL' -> tap back_button -> products_screen visible |
| 5 | Adjust quantity and total | Open product_p1 -> tap increment_button twice -> quantity_text 3, total_text 'Total: 135 TL' -> tap decrement_button 3 times -> quantity_text 1 |
| 6 | Sign out | Sign in -> tap signout_button -> signin_screen visible with empty inputs |
| 7 | Search — narrow the list | Sign in -> type 'esp' into search_input -> product_p1 visible, product_p2 and product_p3 not visible -> open product_p1 -> detail_title 'Espresso' |
| 8 | Search — no match and recovery | Sign in -> type 'xyz' into search_input -> no product_ card visible, empty_text 'No products match' -> clear search_input -> product_p1..p3 visible again |
| 9 | Search — clear button | Sign in -> search_clear_button not visible -> type 'xyz' into search_input -> empty_text visible, search_clear_button visible -> tap search_clear_button -> search_input empty, product_p1..p3 visible, empty_text and search_clear_button not visible |

_Rows 1-8 unchanged. Row 9 added for the clear control shipped in ProductsScreen (testID `search_clear_button`, accessibilityLabel "Clear search", rendered only while the query is non-empty, onPress resets the query); expressed in the testIDs Maestro selects on. No Maestro flows are committed in the repo; DIJJI writes them per task into the run workspace/e2e/mobile/._

### Unit coverage

**Repos:** dijji-mobile-demo

- Mobile app / App — renders without throwing (__tests__/App.test.tsx)
- ProductsScreen search — an empty query lists all 3 product cards and renders no empty-state text
- ProductsScreen search — a case-insensitive substring query ('ESP') narrows the list to the single matching card
- ProductsScreen search — a query matching nothing hides every card and shows 'No products match'
- ProductsScreen search — deleting back to an empty query restores all 3 cards and removes the empty-state text
- ProductsScreen search — title, welcome text and sign-out control stay intact while a query is active
- ProductsScreen search clear button — absent while the query is empty
- ProductsScreen search clear button — appears once a query is typed, including a query that matches nothing, and carries an accessibility label
- ProductsScreen search clear button — pressing it on a narrowing query ('esp') empties the input and restores all 3 cards with no empty-state text
- ProductsScreen search clear button — pressing it on a no-match query ('xyz') empties the input and restores all 3 cards with no empty-state text
- ProductsScreen search clear button — disappears when the query is deleted manually

_11 Jest tests in __tests__/App.test.tsx: the original render smoke test, the 'Products screen search' describe block (5 cases) and the new 'Products screen search clear button' describe block (5 cases), all driven through react-test-renderer act() on the search_input onChangeText / search_clear_button onPress props after a scripted sign-in; react-native-safe-area-context is jest-mocked. SignInScreen, DetailScreen and Root still have no dedicated unit tests._

### Unit coverage (proposed)

**Repos:** dijji-mobile-demo

- SignInScreen — empty-field error, wrong-credential error, trimmed username accepted, onSignedIn called
- ProductsScreen — renders 3 products with prices, welcome text, sign-out callback
- DetailScreen — quantity floor at 1, increment, total = price × quantity, back callback
- Root — screen transitions signin -> products -> detail -> products -> signin

_User-approved unit-test targets per screen; not yet implemented in the repo._

## CI/CD Integration

### Pipeline flow

**Repos:** dijji-mobile-demo

Task branch changes the app:
1. DIJJI writes Maestro flows into the run workspace/e2e/mobile/ and parks the pipeline at the mobile gate.
2. A developer runs `dijji run --platform android` (or ios) in the repo folder.
3. The CLI checks out the commit under test, builds the release app (README build commands),
   installs it on the emulator/simulator, runs the flows and uploads the evidence.
4. DIJJI reads the evidence and passes or fails the stage.
No PR/merge/tag-triggered CI exists in the repo.

_README 'How DIJJI uses this repository'._

### Run frequency

**Repos:** dijji-mobile-demo

| Test type | When |
| --- | --- |
| Unit (Jest) | Manually via npm test — no automated trigger in the repo |
| Lint (ESLint) | Manually via npm run lint |
| E2E (Maestro) | Every DIJJI task that changes the app, at the mobile gate |

_package.json scripts; README._

## Bug Tracking

### Labels

**Repos:** dijji-mobile-demo

- bug
- platform:android
- platform:ios
- e2e-failure
- a11y
- severity:critical / high / medium / low

_User-approved label set; no issue tracker configuration exists in the repo._

### Bug template

**Repos:** dijji-mobile-demo

Title: <screen> — <short symptom>
Platform: Android <version> emulator / iOS <version> simulator / real device
Build: commit SHA, release or debug
Steps to reproduce: numbered, using testIDs where possible
Expected / Actual
Evidence: DIJJI E2E run link, screenshot or recording
Severity: critical / high / medium / low

_User-approved template; no template file exists in the repo (no .github directory)._

## Manual Test Checklist

### Manual Test Checklist

**Repos:** dijji-mobile-demo

- Real Android device and real iPhone — release build launches without Metro
- Dark mode — status bar icons remain visible on every screen
- Large system font / Dynamic Type — titles, cards and stepper do not clip
- TalkBack / VoiceOver — every control is announced by its accessibilityLabel
- On-screen keyboard — inputs and Sign in button stay reachable on small screens
- iPad landscape — layout remains usable
- Android system back / back gesture on each screen
- Notch / gesture-bar devices — content stays inside safe areas

_User-approved checklist; items target surfaces Maestro flows on an emulator/simulator do not cover._
