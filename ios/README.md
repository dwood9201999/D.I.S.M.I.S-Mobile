# D.I.S.M.I.S. native iPhone prototype

This separate SwiftUI target bundles the repository's guide JSON and uses Apple's on-device Foundation Models when the model reports it is available. Guide matching and the original step walkthrough work independently of model readiness. This prototype includes the written guides. The existing Safari preview includes the component photo library.

## Build and test

1. Clone the development branch on a Mac with Xcode and an iOS 26 or later SDK that supports the connected phone.
2. Open `ios/DISMIS.xcodeproj`. Select the DISMIS target and choose your signing team under Signing & Capabilities.
3. Connect the iPhone, select it as the run destination, and run the app. Follow the developer-mode or trust prompts from the device if prompted.
4. With Apple Intelligence ready, find a guide and tap **Explain with on-device AI**. Disable both Wi-Fi and cellular connectivity, relaunch, and repeat. The original guide steps and the generated explanation should each remain available. Test with Apple Intelligence disabled to check the guide-only fallback.

The native target has no server connection and does not send notes or questions to the web app. The source project still needs its first build and physical-device verification on Apple hardware.
