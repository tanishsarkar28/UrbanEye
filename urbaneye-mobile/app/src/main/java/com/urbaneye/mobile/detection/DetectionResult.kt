package com.urbaneye.mobile.detection

import android.graphics.Bitmap
import android.graphics.RectF

data class DetectionResult(
    val type: String, // POTHOLE, ROAD_CRACK, SURFACE_DAMAGE, VEHICLE_FLOW
    val confidence: Float,
    val boundingBox: RectF, // Normalized coordinates [0.0, 1.0]
    val croppedSnippetBase64: String? = null,
    val estimatedDiameterCm: Int? = null,
    val estimatedRepairCost: Int? = null
)
