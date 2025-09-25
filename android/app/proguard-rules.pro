# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
-keep class com.imeuswe.app.BuildConfig { *; }
-keep class com.google.android.gms.internal.consent_sdk.** { *; }

# Fresco
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip
-keep,allowobfuscation @interface com.facebook.jni.annotations.DoNotStrip

-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.common.internal.DoNotStrip *;
}
-keep @com.facebook.jni.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.jni.annotations.DoNotStrip *;
}

-keepclassmembers class * {
    native <methods>;
}

-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}
-dontwarn proguard.annotation.Keep
-dontwarn proguard.annotation.KeepClassMembers

-dontwarn com.google.android.apps.nbu.paisa.inapp.client.api.PaymentsClient
-dontwarn com.google.android.apps.nbu.paisa.inapp.client.api.Wallet
-dontwarn com.google.android.apps.nbu.paisa.inapp.client.api.WalletUtils

-dontwarn okio.**
-dontwarn com.squareup.okhttp.**
-dontwarn okhttp3.**
-dontwarn javax.annotation.**
-dontwarn com.android.volley.toolbox.**
-dontwarn com.facebook.infer.**
-dontwarn io.agora.**
-dontwarn com.payu.**
-dontwarn org.slf4j.impl.StaticLoggerBinder

# Additional rules from the error message
-dontwarn com.facebook.imagepipeline.cache.AnimatedCache
-dontwarn com.facebook.imagepipeline.cache.AnimationFrames
-dontwarn com.facebook.imagepipeline.nativecode.WebpTranscoder


# AGGRESSIVE CHAT SDK PROTECTION
-keep class com.easemob.** { *; }
-keep class com.hyphenate.** { *; }
 
# Keep class members for Chat SDK
-keepclassmembers class com.easemob.** { *; }
 
# Keep specific ChatSDK methods
-keepclassmembers class com.easemob.ext_sdk.dispatch.ExtSdkDispatch {
    public static ** getInstance();
    public void callSdkApi(java.lang.String, java.lang.Object, com.easemob.ext_sdk.common.ExtSdkCallback);
}

# DONTWARN SECTION - All in one place
-dontwarn com.google.android.apps.nbu.paisa.inapp.client.api.**
-dontwarn com.heytap.msp.push.**
-dontwarn com.meizu.cloud.pushsdk.**
-dontwarn com.vivo.push.**
-dontwarn com.xiaomi.mipush.sdk.**
-dontwarn org.slf4j.impl.**
-dontwarn com.google.devtools.build.android.desugar.runtime.ThrowableExtension
-dontwarn proguard.annotation.Keep
-dontwarn proguard.annotation.KeepClassMembers
-dontwarn java.lang.invoke.**
-dontwarn javax.annotation.**
-dontwarn kotlin.**
-dontwarn com.payu.cardscanner.**
-dontwarn com.payu.phonepe.**
-dontwarn com.payu.ppiscanner.**

# Missing class com.google.api.client.http.GenericUrl
-keep class com.google.api.client.http.** { *; }
-dontwarn com.google.api.client.http.GenericUrl
-dontwarn com.google.api.client.http.HttpHeaders
-dontwarn com.google.api.client.http.HttpRequest
-dontwarn com.google.api.client.http.HttpRequestFactory
-dontwarn com.google.api.client.http.HttpResponse
-dontwarn com.google.api.client.http.HttpTransport
-dontwarn com.google.api.client.http.javanet.NetHttpTransport$Builder
-dontwarn com.google.api.client.http.javanet.NetHttpTransport
-dontwarn org.joda.time.Instant
