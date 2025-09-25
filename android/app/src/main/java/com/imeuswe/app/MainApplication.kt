package com.imeuswe.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost

// CleverTap imports
import com.clevertap.android.sdk.ActivityLifecycleCallback;
import com.clevertap.react.CleverTapPackage;
import com.clevertap.android.sdk.CleverTapAPI;

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage()
              add(AgoraCallServicePackage())
              add(ProximitySensorPackage())
              add(PowerButtonPackage())
              add(AudioPackage())
              add(CleverTapPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

// add CleverTapPackage to react-native package list

  override fun onCreate() {
     // Register the CleverTap ActivityLifecycleCallback; before calling super
    ActivityLifecycleCallback.register(this);	
    super.onCreate()
    loadReactNative(this)
    // Register the CleverTap ActivityLifecycleCallback; before calling super
    ActivityLifecycleCallback.register(this);
    //ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)
  }

  private fun createCleverTapNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channelId = "CtRNS"
      val channelName = "CleverTap Push Notifications"
      val channelDescription = "Channel for CleverTap push notifications"
      val importance = NotificationManager.IMPORTANCE_HIGH
      
      val channel = NotificationChannel(channelId, channelName, importance).apply {
        description = channelDescription
        enableLights(true)
        enableVibration(true)
        setShowBadge(true)
      }
      
      val notificationManager = getSystemService(NotificationManager::class.java)
      notificationManager?.createNotificationChannel(channel)
    }
  }
}
