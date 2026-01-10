package com.design_ai

import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Set splash theme before super.onCreate
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)
        
        // Create notification channel for Android O and above
        createNotificationChannel()

        // Uncomment the code below to add a "Test Crash" button for testing Crashlytics
        // After testing, comment it out or remove it before production
        /*
        val crashButton = Button(this)
        crashButton.text = "Test Crash"
        crashButton.setOnClickListener {
            throw RuntimeException("Test Crash") // Force a crash
        }
        addContentView(crashButton, ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT))
        */
    }

    override fun getMainComponentName(): String = "Design_AI"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelId = "default_notification_channel"
            val channelName = "Default Notifications"
            val channelDescription = "Default notification channel for app notifications"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(channelId, channelName, importance)
            channel.description = channelDescription
            channel.enableVibration(true)
            channel.enableLights(true)
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannel(channel)
        }
    }
}
