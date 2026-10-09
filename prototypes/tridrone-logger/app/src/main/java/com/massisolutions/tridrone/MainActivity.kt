package com.massisolutions.tridrone

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.*
import android.widget.*
import java.io.File
import java.util.Locale

class MainActivity : Activity() {
    private lateinit var status: TextView
    private lateinit var details: TextView
    private lateinit var sessions: TextView
    private lateinit var crsSpinner: Spinner
    private val crsLabels = arrayOf("NY Long Island NAD83(2011) — EPSG:6539", "WGS84 geographic — EPSG:4326")
    private val crsCodes = arrayOf("EPSG:6539", "EPSG:4326")
    private val handler = Handler(Looper.getMainLooper())
    private val requestCode = 31
    private val refresh = object : Runnable {
        override fun run() {
            updateDisplay()
            handler.postDelayed(this, 1000)
        }
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val root = ScrollView(this)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 44, 32, 36)
        }
        fun label(text: String, size: Float): TextView = TextView(this).apply {
            this.text = text
            textSize = size
            setPadding(0, 10, 0, 10)
        }
        layout.addView(label("TriDrone | Survey Logger", 24f))
        layout.addView(label("GNSS logger v0.2 • Offline", 14f))
        status = label("Checking logger status...", 19f)
        details = label("Waiting for GPS observations", 17f)
        sessions = label("No sessions yet", 15f)
        layout.addView(label("HORIZONTAL COORDINATE SYSTEM", 15f))
        crsSpinner = Spinner(this)
        crsSpinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, crsLabels)
        val settings = getSharedPreferences("survey_settings", MODE_PRIVATE)
        crsSpinner.setSelection(if (settings.getString("crs", "EPSG:6539") == "EPSG:4326") 1 else 0)
        crsSpinner.onItemSelectedListener = object : android.widget.AdapterView.OnItemSelectedListener {
            override fun onNothingSelected(parent: android.widget.AdapterView<*>?) {}
            override fun onItemSelected(parent: android.widget.AdapterView<*>?, view: android.view.View?, position: Int, id: Long) {
                settings.edit().putString("crs", crsCodes[position]).apply()
                updateDisplay()
            }
        }
        layout.addView(crsSpinner)
        layout.addView(label("VERTICAL DATUM: NAVD88 (EPSG:6360) — elevations pending control", 13f))
        layout.addView(status)
        layout.addView(details)
        layout.addView(Button(this).apply {
            text = "START GPS SURVEY"
            setOnClickListener { startSurvey() }
        })
        layout.addView(Button(this).apply {
            text = "STOP SURVEY"
            setOnClickListener {
                stopService(Intent(this@MainActivity, SurveyService::class.java))
                status.text = "Stop requested"
                updateDisplay()
            }
        })
        layout.addView(Button(this).apply {
            text = "EXPORT LATEST CSV"
            setOnClickListener { exportLatest() }
        })
        layout.addView(label("Recent session", 18f))
        layout.addView(sessions)
        layout.addView(label("EPSG:6539 projection is not implemented. Selection is a display preference only; CSV currently stores raw latitude/longitude. Phone GNSS is not survey-grade.", 13f))
        root.addView(layout)
        setContentView(root)
    }
    override fun onResume() {
        super.onResume()
        handler.removeCallbacks(refresh)
        handler.post(refresh)
    }
    override fun onPause() {
        handler.removeCallbacks(refresh)
        super.onPause()
    }
    private fun latest(): File? = File(filesDir, "surveys").listFiles { f -> f.isFile && f.extension == "csv" }?.maxByOrNull { it.lastModified() }
    private fun updateDisplay() {
        val p = getSharedPreferences("logger_status", MODE_PRIVATE)
        val state = p.getString("state", "idle") ?: "idle"
        val count = p.getInt("points", 0)
        status.text = when(state) {
            "recording" -> "RECORDING • $count GPS points"
            "waiting" -> "WAITING FOR GPS FIX • $count points"
            "error" -> "ERROR: " + p.getString("error", "unknown")
            else -> "Not recording"
        }
        val lat = p.getString("lat", null)
        val lon = p.getString("lon", null)
        val accuracy = p.getFloat("accuracy", -1f)
        val selectedCrs = getSharedPreferences("survey_settings", MODE_PRIVATE).getString("crs", "EPSG:6539")
        details.text = if (lat != null && lon != null) {
            "Latitude: $lat\nLongitude: $lon\nHorizontal accuracy: " +
                (if (accuracy >= 0) String.format(Locale.US, "%.1f m", accuracy) else "Unknown") +
                "\nSession points: $count"
        } else "No GPS fix yet. Try outdoors when convenient.\nSession points: $count"
        val file = latest()
        sessions.text = if (file == null) "No CSV session found" else
            "${file.name}\n${file.length()} bytes"
    }
    private fun startSurvey() {
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), requestCode)
            return
        }
        try {
            startForegroundService(Intent(this, SurveyService::class.java))
            status.text = "Starting logger..."
        } catch (e: Exception) {
            status.text = "Unable to start: ${e.message}"
        }
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 32)
        }
    }
    private fun exportLatest() {
        val file = latest()
        if (file == null) {
            Toast.makeText(this, "No survey CSV to export", Toast.LENGTH_LONG).show()
            return
        }
        try {
            val shareCopy = File(cacheDir, "tridrone_export.csv")
            file.inputStream().use { input -> shareCopy.outputStream().use { output -> input.copyTo(output) } }
            val uri = androidx.core.content.FileProvider.getUriForFile(this, "$packageName.fileprovider", shareCopy)
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "text/csv"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            startActivity(Intent.createChooser(intent, "Export TriDrone CSV"))
        } catch (e: Exception) {
            Toast.makeText(this, "Export failed: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
    override fun onRequestPermissionsResult(code: Int, permissions: Array<out String>, results: IntArray) {
        super.onRequestPermissionsResult(code, permissions, results)
        if (code == requestCode) {
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) startSurvey()
            else status.text = "Precise location permission required"
        }
    }
}
