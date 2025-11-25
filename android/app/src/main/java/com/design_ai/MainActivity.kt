package com.design_ai

import android.os.Bundle // ✅ this is the missing import
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) { // ✅ correct signature
        // Set splash theme before super.onCreate
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)
    }

    override fun getMainComponentName(): String = "Design_AI"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
