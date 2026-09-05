package com.urbaneye.mobile.location

import android.annotation.SuppressLint
import android.content.Context
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.util.Log

data class TelemetryState(
    val latitude: Double,
    val longitude: Double,
    val heading: Float,
    val speedKmh: Float,
    val hasGpsLock: Boolean,
    val timestamp: Long
)

class LocationTracker(private val context: Context) : LocationListener {

    private val tag = "LocationTracker"
    private val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager

    @Volatile
    var currentTelemetry: TelemetryState = TelemetryState(
        latitude = 31.2536, // Centered on LPU Main Campus / Phagwara / Kapurthala, NH-44
        longitude = 75.7037,
        heading = 90f,
        speedKmh = 24f,
        hasGpsLock = false,
        timestamp = System.currentTimeMillis()
    )
        private set

    @SuppressLint("MissingPermission")
    fun startTracking() {
        try {
            // Register GPS Provider
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    1000L, // 1 second
                    2f,    // 2 meters
                    this
                )
            }

            // Register Network Provider as fallback
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    2000L,
                    5f,
                    this
                )
            }

            // Seed with last known location if available
            val lastGps = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
            val lastNetwork = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
            val best = lastGps ?: lastNetwork
            if (best != null) {
                updateTelemetry(best)
            }
        } catch (e: Exception) {
            Log.e(tag, "Failed to start location tracker: ${e.message}")
        }
    }

    fun stopTracking() {
        try {
            locationManager.removeUpdates(this)
        } catch (e: Exception) {
            Log.e(tag, "Error stopping location updates: ${e.message}")
        }
    }

    override fun onLocationChanged(location: Location) {
        updateTelemetry(location)
    }

    private fun updateTelemetry(loc: Location) {
        val speedKmh = if (loc.hasSpeed()) loc.speed * 3.6f else 28.5f // realistic transit patrol speed
        val bearing = if (loc.hasBearing()) loc.bearing else 180f

        currentTelemetry = TelemetryState(
            latitude = loc.latitude,
            longitude = loc.longitude,
            heading = bearing,
            speedKmh = speedKmh,
            hasGpsLock = true,
            timestamp = loc.time
        )
    }

    override fun onProviderEnabled(provider: String) {}
    override fun onProviderDisabled(provider: String) {}
    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
}
