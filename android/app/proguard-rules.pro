# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Firebase
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# React Native Firebase
-keep class io.invertase.firebase.** { *; }
-dontwarn io.invertase.firebase.**

# Keep Firebase Messaging
-keep class com.google.firebase.messaging.** { *; }
-keep class com.google.firebase.iid.** { *; }

# Keep Firebase Analytics
-keep class com.google.firebase.analytics.** { *; }

# Keep Firebase Crashlytics
-keep class com.google.firebase.crashlytics.** { *; }
-dontwarn com.google.firebase.crashlytics.**

# React Native Core & JavaScript Engine
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-dontwarn com.facebook.react.**

# React Native Reanimated & Worklets
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }
-dontwarn com.swmansion.reanimated.**
-dontwarn com.swmansion.worklets.**
