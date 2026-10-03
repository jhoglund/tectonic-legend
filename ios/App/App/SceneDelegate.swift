import UIKit
import Capacitor

/**
 * UIScene lifecycle adoption.
 *
 * iOS 27 traps at launch (`EXC_BREAKPOINT` in
 * `_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`) when an app
 * linked against the iOS 26+ SDK has no scene manifest. Build 7 was linked
 * against an older SDK and got the legacy grace; build 8, archived with
 * Xcode 27, did not, and crashed on every launch.
 *
 * UIKit builds the window from the storyboard named in the scene manifest, so
 * this delegate's job is only to forward the URL and user-activity callbacks
 * that used to reach `AppDelegate`. Capacitor routes both through
 * `ApplicationDelegateProxy`, which is what its plugins listen to; without the
 * forwarding below, deep links and Universal Links would reach nothing.
 */
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        // The scene manifest names Main.storyboard, so UIKit has already built
        // and assigned the window. Building one by hand is the fallback for a
        // scene configured without a storyboard.
        if window == nil, let windowScene = scene as? UIWindowScene {
            let window = UIWindow(windowScene: windowScene)
            window.rootViewController = UIStoryboard(name: "Main", bundle: nil)
                .instantiateInitialViewController()
            self.window = window
            window.makeKeyAndVisible()
        }

        // A cold start from a deep link or Universal Link arrives here rather
        // than through the scene callbacks below.
        if let url = connectionOptions.urlContexts.first?.url {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared, open: url, options: [:]
            )
        }
        for activity in connectionOptions.userActivities {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared, continue: activity, restorationHandler: { _ in }
            )
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        _ = ApplicationDelegateProxy.shared.application(
            UIApplication.shared, open: url, options: [:]
        )
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(
            UIApplication.shared, continue: userActivity, restorationHandler: { _ in }
        )
    }
}
