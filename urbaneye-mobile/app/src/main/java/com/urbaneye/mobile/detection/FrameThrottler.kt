package com.urbaneye.mobile.detection

import android.os.SystemClock

/**
 * Throttles camera frame processing to a target 5-10 FPS inference rate
 * to conserve thermal budget and battery life on continuous bus routes.
 */
class FrameThrottler(targetFps: Int = 8) {
    private val frameIntervalMs = 1000L / targetFps.coerceIn(4, 15)
    private var lastProcessedTimeMs = 0L

    fun shouldProcessNextFrame(): Boolean {
        val now = SystemClock.elapsedRealtime()
        if (now - lastProcessedTimeMs >= frameIntervalMs) {
            lastProcessedTimeMs = now
            return true
        }
        return false
    }

    fun reset() {
        lastProcessedTimeMs = 0L
    }
}
