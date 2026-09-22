# Tech Stack

_A field marked **Repos:** applies only to those repositories; a field without the line is project-wide._

## Frontend

### Selection

**Repos:** dijji-mobile-demo

React Native 0.87.1 + React 19.2.3 + TypeScript

_Cross-platform single JS codebase; Hermes JS engine and the New Architecture (Fabric/TurboModules) are enabled (hermesEnabled=true, newArchEnabled=true in android/gradle.properties). Only extra runtime dependency is react-native-safe-area-context ^5.5.2. Node >= 22.11.0 required by package.json engines._

## Backend

### Selection

**Repos:** dijji-mobile-demo

None

_README states 'no backend'; App.tsx makes no network calls — the product catalog (PRODUCTS) and the demo credential (DEMO_USER) are hardcoded constants._

## Database

### Selection

**Repos:** dijji-mobile-demo

None

_State lives only in React useState hooks (screen, user, quantity); no AsyncStorage or other persistence dependency in package.json._

## Auth / Identity

### Selection

**Repos:** dijji-mobile-demo

Client-side hardcoded demo credential check

_SignInScreen compares the trimmed username and the password against DEMO_USER (demo / demo1234); no token or session is issued, the signed-in user is only in-memory state._

## Infrastructure / Deployment

### Selection

**Repos:** dijji-mobile-demo

Native release builds — Android (Gradle) APK + iOS (CocoaPods/Xcode) simulator .app

_Android: Gradle 9.4.1 wrapper, compileSdk 37, targetSdk 36, minSdk 24, Kotlin 2.2.0, applicationId com.dijjimobiledemo; release build is signed with the template debug keystore (emulator-only). iOS: Podfile + Xcode, deployment target 15.1, bundle id org.reactjs.native.example.DijjiMobileDemo, iPhone + iPad. Release builds embed the JS bundle so no Metro server is needed._

## Storage / Object Store

### Selection

**Repos:** dijji-mobile-demo

None

_No storage dependency in package.json and no file handling in App.tsx._

## Queue / Async Messaging

### Selection

**Repos:** dijji-mobile-demo

None

_No backend and no messaging dependency._

## Observability

### Selection

**Repos:** dijji-mobile-demo

None

_No crash-reporting or analytics dependency in package.json; no logging code in App.tsx._

## CI/CD

### Selection

**Repos:** dijji-mobile-demo

DIJJI pipeline mobile gate (dijji CLI + Maestro); no in-repo CI

_README: when a task changes the app, DIJJI writes Maestro flows into the run workspace/e2e/mobile/, a developer runs `dijji run --platform android|ios`, the CLI builds the exact commit, installs it on an emulator/simulator, runs the flows and uploads evidence. No .github or other CI config exists in the repo._

## Email / Notification

### Selection

**Repos:** dijji-mobile-demo

None

_No notification dependency in package.json; AndroidManifest declares only the INTERNET permission._

## Summary (TL;DR)

### Stack summary

**Repos:** dijji-mobile-demo

| Layer | Selection | Version | Repo |
| --- | --- | --- | --- |
| Frontend | React Native + React + TypeScript | 0.87.1 / 19.2.3 / ^6.0.3 | dijji-mobile-demo |
| Backend | None | — | dijji-mobile-demo |
| Database | None | — | dijji-mobile-demo |
| Auth / Identity | Hardcoded demo credential (client-side) | — | dijji-mobile-demo |
| Infrastructure / Deployment | Android Gradle APK + iOS Xcode .app (release, embedded bundle) | Gradle 9.4.1 / iOS 15.1+ / minSdk 24 | dijji-mobile-demo |
| Storage / Object Store | None | — | dijji-mobile-demo |
| Queue / Async Messaging | None | — | dijji-mobile-demo |
| Observability | None | — | dijji-mobile-demo |
| CI/CD | DIJJI mobile gate (dijji CLI + Maestro) | — | dijji-mobile-demo |
| Email / Notification | None | — | dijji-mobile-demo |

_Aggregated from the per-category Selection fields._
