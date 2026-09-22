# Dijji Mobile Demo

A small React Native app (React Native 0.87, no backend, no navigation library) used to try
[Dijji](https://dijji.ai)'s on-device mobile E2E flow.

Screens: **Sign in** (`demo` / `demo1234`) → **Products** (three coffees) → **Product detail**
(quantity stepper, running total). Every control has a `testID` and an `accessibilityLabel`, so
Maestro flows can select elements by id or by text.

| Platform | Application id | Build |
|---|---|---|
| Android | `com.dijjimobiledemo` | `npm ci && cd android && ./gradlew :app:assembleRelease` → `android/app/build/outputs/apk/release/*.apk` |
| iOS | `org.reactjs.native.example.DijjiMobileDemo` | `npm ci && cd ios && pod install && xcodebuild -workspace DijjiMobileDemo.xcworkspace -scheme DijjiMobileDemo -configuration Release -sdk iphonesimulator -derivedDataPath build build` → `ios/build/Build/Products/Release-iphonesimulator/*.app` |

Release builds are used on purpose: they embed the JavaScript bundle, so the app runs without a
Metro dev server. The Android release build is signed with the template's debug keystore, which is
fine for an emulator.

## Run it yourself

```sh
npm ci
npm run android   # needs an emulator or device; starts Metro
npm run ios       # macOS + Xcode; run `cd ios && pod install` first
```

## How Dijji uses this repository

1. The repository is bound to a Dijji project whose pipeline stage has E2E enabled.
2. When a task changes this app, Dijji writes Maestro flows into `.dijji/e2e/mobile/` on the task
   branch and parks the pipeline at the mobile gate.
3. A developer runs `dijji run --platform android` (or `ios`) inside this folder. The CLI checks out
   the exact commit under test, builds with the command above, installs the app on the emulator or
   simulator, runs the flows, uploads the evidence and puts the folder back as it was.
4. Dijji reads the evidence and passes or fails the stage.
