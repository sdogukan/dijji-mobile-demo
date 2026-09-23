# Design

_A field marked **Repos:** applies only to those repositories; a field without the line is project-wide._

## Page List (Sitemap)

### Public pages

**Repos:** dijji-mobile-demo

| # | Page | URL |
| --- | --- | --- |
| 1 | Sign in | screen: signin (testID signin_screen) |

_Mobile app has no URLs; the URL column holds the Screen state name and root testID._

### Admin pages

**Repos:** dijji-mobile-demo

| # | Page | URL |
| --- | --- | --- |
| 2 | Products | screen: products (testID products_screen) |
| 3 | Product detail | screen: detail + product (testID detail_screen) |

_Reachable only after a successful sign-in in Root._

## Wireframes

### Sign in — wireframe

**Repos:** dijji-mobile-demo

```
+------------------------------+
| Sign in                      |
| Demo account: demo / demo1234|
| +--------------------------+ |
| | Username                 | |
| +--------------------------+ |
| +--------------------------+ |
| | Password (masked)        | |
| +--------------------------+ |
| [error text, red, optional]  |
| +--------------------------+ |
| |        Sign in           | |
| +--------------------------+ |
+------------------------------+
```

_testIDs: signin_title, username_input, password_input, signin_error, signin_button._

### Sign in — notes

**Repos:** dijji-mobile-demo

Container: SafeAreaView, padding 24, vertical gap 12, white background.
Username: no auto-capitalize, no autocorrect; value is trimmed on submit.
Password: secureTextEntry.
States: idle; error "Enter your username and password." (empty field); error "Wrong username or password." (mismatch); success -> Products.
Keyboard: Android activity uses adjustResize.

_SignInScreen + AndroidManifest windowSoftInputMode._

### Products — wireframe

**Repos:** dijji-mobile-demo

```
+------------------------------+
| Products            Sign out |
| Welcome, demo                |
| +--------------------------+ |
| | Espresso           45 TL | |
| +--------------------------+ |
| | Flat White         65 TL | |
| +--------------------------+ |
| | Cold Brew          70 TL | |
| +--------------------------+ |
+------------------------------+
```

_Conflict: ProductsScreen renders a `searchContainer` View between `welcome_text` and the product list, holding a TextInput (testID `search_input`, placeholder "Search products", right padding 36) and, only while the query is non-empty, a "×" Pressable (testID `search_clear_button`) absolutely positioned 10pt from the input's right edge; an empty-state Text (testID `empty_text`) replaces the list when nothing matches. The committed wireframe shows none of these. A wireframe is an intent artifact, so the existing diagram is kept unchanged until the user chooses._

### Products — notes

**Repos:** dijji-mobile-demo

Header: row with title left, "Sign out" link right.
Body: FlatList of cards (border, radius 12, padding 16), name left, "<price> TL" right.
Each card's accessibilityLabel is the product name.
States: only a populated state — no empty/loading/error, since data is static.

_Conflict: the code has two list states (populated / empty) and a search box with autoCapitalize=none, autoCorrect=false, matching a case-insensitive substring of `name` only — `description` is not searched. This change adds a clear control: rendered only while the query is non-empty, accessibilityLabel "Clear search", hitSlop 12, onPress resets the query to '' (list restored, empty-state text removed); deleting the text manually also hides it. The committed note explicitly states there is no empty state. Notes are an intent artifact, so the existing value is kept unchanged until the user chooses._

### Product detail — wireframe

**Repos:** dijji-mobile-demo

```
+------------------------------+
| < Back                       |
| Flat White                   |
| Espresso with velvety ...    |
|  ( - )      1       ( + )    |
| Total: 65 TL                 |
+------------------------------+
```

_testIDs: back_button, detail_title, decrement_button, quantity_text, increment_button, total_text._

### Product detail — notes

**Repos:** dijji-mobile-demo

Stepper: 44x44 circular buttons, quantity centered (min width 32).
Quantity accessibilityLabel is "Quantity <n>".
Total: "Total: <price × quantity> TL", bold.
States: quantity = 1 (decrement has no effect); quantity > 1.
Edge: no upper bound on quantity; no add-to-cart or checkout action.

_DetailScreen._

### Product detail — Android back behavior

**Repos:** dijji-mobile-demo

Keep current behavior (known demo limitation): Android system back / back gesture backgrounds the app from every screen; the on-screen '‹ Back' link is the only in-app way back to Products

_No BackHandler registration in App.tsx and no navigation library, so ReactActivity's default back handling finishes/backgrounds the activity from any screen. iOS has no hardware back. The user chose to keep this behavior and document it rather than add back handling._

## Design System

### Color palette

**Repos:** dijji-mobile-demo

Background: #ffffff
Primary (button, links): #2563eb
Text: #111827 (primary), #374151 (price), #6b7280 (hint/secondary)
Border: #d1d5db (inputs, stepper), #e5e7eb (cards)
Semantic: error #b91c1c; success / warning / info not defined

_StyleSheet in App.tsx; Tailwind-gray/blue/red equivalent values._

### Color palette — dark mode

**Repos:** dijji-mobile-demo

Light theme only: screens stay on the light palette in system dark mode; status bar content is always dark (dark-content) on every platform; no dark theme

_Current code: App.tsx switches StatusBar barStyle to 'light-content' when useColorScheme() is 'dark' while styles.screen.backgroundColor is hardcoded #ffffff, which makes status bar icons invisible; Android AppTheme extends Theme.AppCompat.DayNight. The user chose a fixed light theme (smallest change): barStyle becomes a constant dark-content, no dark palette is introduced._

### Typography

**Repos:** dijji-mobile-demo

Font: platform system font (no custom font).
Scale: 14 (hint, error) / 16 (input, button, link) / 18 (card) / 20 (quantity, total) / 22 (stepper glyph) / 28 (title).
Weights: 600 (button, card title, quantity), 700 (title, total).

_StyleSheet in App.tsx._

### Spacing

**Repos:** dijji-mobile-demo

Screen padding 24; vertical gap 12; row gap 16.
Card padding 16, card bottom margin 12.
Input padding 12 horizontal / 10 vertical; button padding 12 vertical.

_No formal base unit; values are multiples of 4 (effectively a 4-pt grid)._

### Border radius

**Repos:** dijji-mobile-demo

md 8 (input, primary button)
lg 12 (product card)
full 22 (44x44 stepper buttons)

_StyleSheet in App.tsx; sm/xl not used._

### Component patterns

**Repos:** dijji-mobile-demo

Primary button: Pressable, #2563eb fill, white 16/600 label, radius 8.
Link: Pressable text, #2563eb, 16.
Input: TextInput, 1px #d1d5db border, radius 8.
Card: Pressable row, 1px #e5e7eb border, radius 12, name left / price right.
Stepper button: 44x44 circle, 1px border.
Modal: none.
Rule: every Pressable/TextInput has a testID and an accessibilityLabel.

_New pattern in App.tsx not in the committed list: an inline clear icon button — a Pressable absolutely positioned inside a `searchContainer` wrapper (right 10, padding 4, hitSlop 12) over a TextInput given extra right padding (36), showing a "×" glyph at 18/600 in #6b7280, rendered only while the input is non-empty. It reuses existing palette and type-scale tokens and carries a testID + accessibilityLabel, so Color palette, Typography and the testability rule are unaffected. The component list is a design-system decision, so the existing value is kept unchanged until the user chooses._

### Responsive breakpoints

**Repos:** dijji-mobile-demo

- No width breakpoints — single fluid layout
- iPhone: portrait only
- iPad: portrait + landscape (TARGETED_DEVICE_FAMILY 1,2)
- Android: orientation not locked

_Info.plist UISupportedInterfaceOrientations / ~ipad, project.pbxproj TARGETED_DEVICE_FAMILY, AndroidManifest has no screenOrientation._

### Animation

**Repos:** dijji-mobile-demo

None. Screen changes are instant state swaps (no transition); only platform-default Pressable feedback.

_No Animated/Reanimated usage in App.tsx._

## Framework Config

### Framework Config

**Repos:** dijji-mobile-demo

Styling: React Native StyleSheet.create in App.tsx (no theme provider, no Tailwind/NativeWind).
Safe areas: SafeAreaProvider at the root, SafeAreaView per screen.
Tooling: @react-native/babel-preset, @react-native/metro-config (defaults),
@react-native/typescript-config, ESLint @react-native, Prettier
(singleQuote, trailingComma: all, arrowParens: avoid).

_App.tsx, babel.config.js, metro.config.js, tsconfig.json, .eslintrc.js, .prettierrc.js._
