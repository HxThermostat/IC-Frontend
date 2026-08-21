//import UIKit
//import React
//import React_RCTAppDelegate
//import ReactAppDependencyProvider
//import RNBootSplash
//import EXUpdates
//
//@main
//class AppDelegate: UIResponder, UIApplicationDelegate {
//  var window: UIWindow?
//
//  var reactNativeDelegate: ReactNativeDelegate?
//  var reactNativeFactory: RCTReactNativeFactory?
//
//  func application(
//    _ application: UIApplication,
//    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
//  ) -> Bool {
//    
//    window = UIWindow(frame: UIScreen.main.bounds)
//    
//    AppController.initializeWithoutStarting()
//    if AppController.sharedInstance.isActiveController {
//        AppController.sharedInstance.start()
//      } else {
//        print("🚀 Skipping start() call - using DevLauncherAppController or DisabledAppController")
//      }
//
//    let delegate = ReactNativeDelegate()
//    let factory = RCTReactNativeFactory(delegate: delegate)
//    delegate.dependencyProvider = RCTAppDependencyProvider()
//
//    reactNativeDelegate = delegate
//    reactNativeFactory = factory
//
//    factory.startReactNative(
//      withModuleName: "main",
//      in: window,
//      launchOptions: launchOptions
//    )
//
//    return true
//  }
//
//  func application(
//    _ app: UIApplication,
//    open url: URL,
//    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
//  ) -> Bool {
//    return RCTLinkingManager.application(app, open: url, options: options)
//  }
//
//  func application(
//    _ application: UIApplication,
//    continue userActivity: NSUserActivity,
//    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
//  ) -> Bool {
//    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
//  }
//}
//
//class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
//  override func sourceURL(for bridge: RCTBridge) -> URL? {
//    self.bundleURL()
//  }
//  
//  override func customize(_ rootView: RCTRootView) {
//      super.customize(rootView)
//      RNBootSplash.initWithStoryboard("LaunchScreen", rootView: rootView)
//  }
//
//  override func bundleURL() -> URL? {
//#if DEBUG
//    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
//#else
//    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
//#endif
//  }
//}

import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash
import EXUpdates

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {

    window = UIWindow(frame: UIScreen.main.bounds)

    // Initialize without starting
    AppController.initializeWithoutStarting()

    // ✅ Handle DevLauncher vs Production
    if AppController.sharedInstance is DevLauncherAppController {
      print("🚀 DevLauncher detected, skipping AppController.start()")
    } else if AppController.sharedInstance.isActiveController {
      print("🚀 Starting AppController")
      AppController.sharedInstance.start()
    } else {
      print("🚀 Skipping AppController.start() - not active controller")
    }

    // Setup React Native
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // Handle deep links
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }

  func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RCTLinkingManager.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    // ✅ Ensure splash initializes here
    RNBootSplash.initWithStoryboard("LaunchScreen", rootView: rootView)
  }

  override func bundleURL() -> URL? {
    #if DEBUG
      RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
      Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
}
