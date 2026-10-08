package com.massisolutions.tridrone

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {
    private lateinit var status: TextView
    private val requestCode = 31

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(36, 60, 36, 24)
        }
        val title = TextView(this).apply { text = "TriDrone Logger — V0.1"; textSize = 24f }
        status = TextView(this).apply { text = "Ready. CSV saved to app-private surveys folder."; textSize = 16f }
        val start = Button(this).apply {
            text = "Start GPS survey"
            setOnClickListener { startSurvey() }
        }
        val stop = Button(this).apply {
            text = "Stop survey"
            setOnClickListener {
                stopService(Intent(this@MainActivity, SurveyService::class.java))
                status.text = "Recording stopped."
            }
        }
        layout.addView(title)
        layout.addView(status)
        layout.addView(start)
        layout.addView(stop)
        setContentView(layout)
    }

    private fun startSurvey() {
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ), requestCode)
            return
        }
        startForegroundService(Intent(this, SurveyService::class.java))
        status.text = "Recording requested. Check notification."
        if (Build.VERSION.SDK_INT >= 33 &&
            checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 32)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == this.requestCode &&
            checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) startSurvey()
        else if (requestCode == this.requestCode) status.text = "Precise location permission required."
    }
}
