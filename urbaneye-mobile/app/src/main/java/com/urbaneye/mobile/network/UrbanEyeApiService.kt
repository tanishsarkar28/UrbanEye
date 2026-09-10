package com.urbaneye.mobile.network

import com.google.gson.annotations.SerializedName
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import java.util.concurrent.TimeUnit

// DTOs
data class PairingRequestResponse(
    @SerializedName("deviceSessionId") val deviceSessionId: String,
    @SerializedName("pin") val pin: String,
    @SerializedName("expiresAt") val expiresAt: String,
    @SerializedName("ttlSeconds") val ttlSeconds: Int
)

data class PairingStatusResponse(
    @SerializedName("deviceSessionId") val deviceSessionId: String,
    @SerializedName("status") val status: String, // PENDING, PAIRED, EXPIRED
    @SerializedName("busLabel") val busLabel: String?,
    @SerializedName("routeTag") val routeTag: String?,
    @SerializedName("districtId") val districtId: String?,
    @SerializedName("districtName") val districtName: String?
)

data class EventIngestRequest(
    @SerializedName("deviceSessionId") val deviceSessionId: String,
    @SerializedName("type") val type: String,
    @SerializedName("confidence") val confidence: Float,
    @SerializedName("latitude") val latitude: Double,
    @SerializedName("longitude") val longitude: Double,
    @SerializedName("heading") val heading: Float?,
    @SerializedName("speed") val speed: Float?,
    @SerializedName("imageSnippet") val imageSnippet: String?,
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("estimatedDiameterCm") val estimatedDiameterCm: Float? = null,
    @SerializedName("estimatedRepairCost") val estimatedRepairCost: Float? = null
)

data class EventIngestResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("eventId") val eventId: String,
    @SerializedName("districtId") val districtId: String,
    @SerializedName("busLabel") val busLabel: String
)

interface UrbanEyeApiService {
    @POST("api/pairing/request")
    suspend fun requestPairing(): Response<PairingRequestResponse>

    @GET("api/pairing/status/{deviceSessionId}")
    suspend fun checkPairingStatus(@Path("deviceSessionId") deviceSessionId: String): Response<PairingStatusResponse>

    @POST("api/events/ingest")
    suspend fun ingestEvent(@Body request: EventIngestRequest): Response<EventIngestResponse>
}

object NetworkClient {
    // Default to the computer's current Wi-Fi LAN IP (or http://10.0.2.2:5000/ for emulator)
    var baseUrl: String = "http://172.21.0.178:5000/"
        private set

    private var _apiService: UrbanEyeApiService? = null

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BASIC
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .build()

    fun updateBaseUrl(newUrl: String) {
        var cleanUrl = newUrl.trim()
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            cleanUrl = "http://$cleanUrl"
        }
        // Normalize: remove trailing slash first to check for /api suffix
        cleanUrl = cleanUrl.trimEnd('/')
        if (cleanUrl.endsWith("/api")) {
            cleanUrl = cleanUrl.substringBeforeLast("/api")
        }
        baseUrl = "$cleanUrl/"
        _apiService = null // Re-create on next access
    }

    val apiService: UrbanEyeApiService
        get() {
            return _apiService ?: synchronized(this) {
                _apiService ?: Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build()
                    .create(UrbanEyeApiService::class.java).also { _apiService = it }
            }
        }
}
