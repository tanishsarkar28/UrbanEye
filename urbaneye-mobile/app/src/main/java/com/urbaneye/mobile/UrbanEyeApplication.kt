package com.urbaneye.mobile

import android.app.Application
import android.util.Log

class UrbanEyeApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Log.i("UrbanEye", "UrbanEye Mobile Edge-AI Platform initialized.")
    }
}
