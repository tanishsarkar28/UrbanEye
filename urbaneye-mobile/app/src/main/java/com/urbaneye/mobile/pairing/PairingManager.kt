package com.urbaneye.mobile.pairing

import android.content.Context
import android.util.Log
import com.urbaneye.mobile.network.NetworkClient
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

sealed class PairingState {
    object Uninitialized : PairingState()
    data class Pending(val pin: String, val deviceSessionId: String, val ttlSeconds: Int) : PairingState()
    data class Paired(val deviceSessionId: String, val busLabel: String, val districtName: String?) : PairingState()
    data class Error(val message: String) : PairingState()
}

class PairingManager(private val context: Context) {

    private val tag = "PairingManager"
    private val prefs = context.getSharedPreferences("urbaneye_pairing", Context.MODE_PRIVATE)
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val _state = MutableStateFlow<PairingState>(PairingState.Uninitialized)
    val state: StateFlow<PairingState> = _state.asStateFlow()

    private var pollJob: Job? = null

    init {
        restoreExistingSession()
    }

    private fun restoreExistingSession() {
        val savedSessionId = prefs.getString("deviceSessionId", null)
        val savedBusLabel = prefs.getString("busLabel", null)
        val savedDistrict = prefs.getString("districtName", null)

        if (!savedSessionId.isNullOrEmpty() && !savedBusLabel.isNullOrEmpty()) {
            _state.value = PairingState.Paired(savedSessionId, savedBusLabel, savedDistrict)
            Log.i(tag, "Restored active bus session: $savedBusLabel ($savedSessionId)")
        } else {
            initiateNewPairingRequest()
        }
    }

    fun initiateNewPairingRequest() {
        pollJob?.cancel()
        scope.launch {
            try {
                val response = NetworkClient.apiService.requestPairing()
                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    Log.i(tag, "Generated 6-Digit PIN: ${body.pin} for Session: ${body.deviceSessionId}")
                    _state.value = PairingState.Pending(body.pin, body.deviceSessionId, body.ttlSeconds)

                    // Start polling for pairing confirmation from District Head on the portal
                    startPollingStatus(body.deviceSessionId)
                } else {
                    _state.value = PairingState.Error("Failed to initiate pairing: HTTP ${response.code()}")
                }
            } catch (e: Exception) {
                _state.value = PairingState.Error("Network error: ${e.message}")
            }
        }
    }

    private fun startPollingStatus(sessionId: String) {
        pollJob?.cancel()
        pollJob = scope.launch {
            while (isActive) {
                delay(2000L) // poll every 2 seconds
                try {
                    val res = NetworkClient.apiService.checkPairingStatus(sessionId)
                    if (res.isSuccessful && res.body() != null) {
                        val body = res.body()!!
                        if (body.status == "PAIRED") {
                            Log.i(tag, "🎉 PIN Verified & Paired by District Head to Bus: ${body.busLabel} (${body.districtName})")

                            // Save to SharedPreferences
                            prefs.edit()
                                .putString("deviceSessionId", body.deviceSessionId)
                                .putString("busLabel", body.busLabel)
                                .putString("districtId", body.districtId)
                                .putString("districtName", body.districtName)
                                .apply()

                            _state.value = PairingState.Paired(
                                deviceSessionId = body.deviceSessionId,
                                busLabel = body.busLabel ?: "Active Transit Unit",
                                districtName = body.districtName
                            )
                            break
                        } else if (body.status == "EXPIRED") {
                            _state.value = PairingState.Error("PIN expired. Tap to generate new PIN.")
                            break
                        }
                    }
                } catch (e: Exception) {
                    Log.d(tag, "Polling status check: ${e.message}")
                }
            }
        }
    }

    fun unpairAndReset() {
        pollJob?.cancel()
        prefs.edit().clear().apply()
        initiateNewPairingRequest()
    }

    fun getActiveSessionId(): String? {
        val s = _state.value
        return if (s is PairingState.Paired) s.deviceSessionId else null
    }

    fun getActiveBusLabel(): String? {
        val s = _state.value
        return if (s is PairingState.Paired) s.busLabel else null
    }
}
