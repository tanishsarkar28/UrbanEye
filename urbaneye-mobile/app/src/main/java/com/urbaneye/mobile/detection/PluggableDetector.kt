package com.urbaneye.mobile.detection

import android.graphics.Bitmap

/**
 * Pluggable edge-AI model interface.
 * Allows Phase 1 (Potholes, Road Defects), Phase 2 (Signs, Waterlogging),
 * and Phase 3 (ANPR) models to be plugged in interchangeably.
 */
interface PluggableDetector {
    val modelName: String
    val targetConfidenceThreshold: Float

    /**
     * Executes genuine on-device inference on a raw camera frame.
     */
    fun detect(bitmap: Bitmap, rotationDegrees: Int): List<DetectionResult>

    /**
     * Frees hardware/accelerator resources when stopping or switching models.
     */
    fun release()
}
