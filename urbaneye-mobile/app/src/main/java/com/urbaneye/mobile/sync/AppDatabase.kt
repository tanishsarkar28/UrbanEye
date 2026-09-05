package com.urbaneye.mobile.sync

import androidx.room.*
import android.content.Context

@Entity(tableName = "queued_events")
data class EventEntity(
    @PrimaryKey(autoGenerate = true) val localId: Long = 0,
    val deviceSessionId: String,
    val type: String,
    val confidence: Float,
    val latitude: Double,
    val longitude: Double,
    val heading: Float?,
    val speed: Float?,
    val imageSnippet: String?,
    val timestamp: String,
    val retryCount: Int = 0,
    val createdAtMs: Long = System.currentTimeMillis()
)

@Dao
interface EventDao {
    @Insert
    suspend fun insertEvent(event: EventEntity): Long

    @Query("SELECT * FROM queued_events ORDER BY createdAtMs ASC LIMIT 20")
    suspend fun getPendingEvents(): List<EventEntity>

    @Query("DELETE FROM queued_events WHERE localId = :id")
    suspend fun deleteEvent(id: Long)

    @Query("UPDATE queued_events SET retryCount = retryCount + 1 WHERE localId = :id")
    suspend fun incrementRetry(id: Long)

    @Query("SELECT COUNT(*) FROM queued_events")
    suspend fun getPendingCount(): Int
}

@Database(entities = [EventEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun eventDao(): EventDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "urbaneye_events.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
