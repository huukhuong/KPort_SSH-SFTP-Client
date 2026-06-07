# Release signing

KPort CI builds unsigned artifacts today. Before distributing publicly, configure code signing per platform.

## macOS (notarization)

1. Join the Apple Developer Program.
2. Create a `Developer ID Application` certificate in Xcode or Keychain Access.
3. Add GitHub Actions secrets:
   - `MAC_CERTIFICATE_BASE64` — exported `.p12` (base64)
   - `MAC_CERTIFICATE_PASSWORD`
   - `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`
4. Set in `electron-builder` config:
   - `mac.identity`
   - `afterSign` hook for `@electron/notarize`

## Windows

1. Purchase an Authenticode code-signing certificate.
2. Add secrets:
   - `WIN_CERTIFICATE_BASE64`
   - `WIN_CERTIFICATE_PASSWORD`
3. Set `win.certificateFile` / `win.certificatePassword` in `electron-builder`.

## Linux

AppImage/deb packages are usually distributed unsigned. Optional GPG signing can be added later.

## Credential storage

Server passwords are encrypted at rest with Electron `safeStorage` (OS keychain/backend) when available. Existing plaintext rows are migrated on startup.
