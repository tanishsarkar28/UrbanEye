package com.urbaneye.mobile.ui

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import com.urbaneye.mobile.detection.DetectionResult

class OverlayView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private val boxPaint = Paint().apply {
        style = Paint.Style.STROKE
        strokeWidth = 6f
        isAntiAlias = true
    }

    private val textBgPaint = Paint().apply {
        style = Paint.Style.FILL
        color = Color.argb(190, 0, 0, 0)
    }

    private val textPaint = Paint().apply {
        color = Color.WHITE
        textSize = 34f
        isFakeBoldText = true
        isAntiAlias = true
    }

    private var detections: List<DetectionResult> = emptyList()

    fun setDetections(results: List<DetectionResult>) {
        this.detections = results
        postInvalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val viewWidth = width.toFloat()
        val viewHeight = height.toFloat()

        for (detection in detections) {
            val box = detection.boundingBox

            // Map normalized coordinates [0, 1] to view dimensions
            val screenRect = RectF(
                box.left * viewWidth,
                box.top * viewHeight,
                box.right * viewWidth,
                box.bottom * viewHeight
            )

            // Distinct color by defect type — matches detectionCategories.ts hex table exactly.
            // Phase 1 live categories only; future phases will add cases here when implemented.
            val color = when (detection.type) {
                // PHASE 1 — LIVE
                "POTHOLE"        -> Color.rgb(249, 115,  22) // #f97316 Orange
                "ROAD_CRACK"     -> Color.rgb(234, 179,   8) // #eab308 Amber
                "SURFACE_DAMAGE" -> Color.rgb(146,  64,  14) // #92400e Ochre
                "WATERLOGGING"   -> Color.rgb( 37,  99, 235) // #2563eb Blue
                "VEHICLE_FLOW"   -> Color.rgb(124,  58, 237) // #7c3aed Purple
                // Unknown / future category — neutral slate
                else             -> Color.rgb(100, 116, 139) // #64748b Slate-500
            }
            boxPaint.color = color

            // Draw bounding rectangle
            canvas.drawRoundRect(screenRect, 8f, 8f, boxPaint)

            // Draw label pill
            val label = "${detection.type} ${(detection.confidence * 100).toInt()}%"
            val textWidth = textPaint.measureText(label)
            val textHeight = 44f

            val labelRect = RectF(
                screenRect.left,
                (screenRect.top - textHeight).coerceAtLeast(0f),
                screenRect.left + textWidth + 24f,
                screenRect.top.coerceAtLeast(textHeight)
            )

            canvas.drawRoundRect(labelRect, 6f, 6f, textBgPaint)
            canvas.drawText(label, labelRect.left + 12f, labelRect.bottom - 12f, textPaint)
        }
    }
}
