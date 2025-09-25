package com.imeuswe.app;

import android.annotation.SuppressLint;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.PowerManager;
import android.view.WindowManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ProximitySensorModule extends ReactContextBaseJavaModule implements SensorEventListener {
    private final ReactApplicationContext reactContext;
    private final SensorManager sensorManager;
    private final Sensor proximitySensor;
    private final PowerManager.WakeLock wakeLock;

    public ProximitySensorModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        sensorManager = (SensorManager) reactContext.getSystemService(Context.SENSOR_SERVICE);
        proximitySensor = sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY);

        PowerManager powerManager = (PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK, "ProximitySensor:WakeLock");
    }

    @NonNull
    @Override
    public String getName() {
        return "ProximitySensor";
    }

    @ReactMethod
    public void startProximityListener() {
        if (proximitySensor != null) {
            sensorManager.registerListener(this, proximitySensor, SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    @ReactMethod
    public void stopProximityListener() {
        sensorManager.unregisterListener(this);
        if (wakeLock.isHeld()) {
            wakeLock.release();
        }
    }

    @SuppressLint("WakelockTimeout")
    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_PROXIMITY) {
            if (event.values[0] < proximitySensor.getMaximumRange()) {
                // Object is near - TURN OFF SCREEN
                if (!wakeLock.isHeld()) {
                    wakeLock.acquire();
                }
            } else {
                // Object is far - TURN ON SCREEN
                if (wakeLock.isHeld()) {
                    wakeLock.release();
                }
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int i) {

    }
}
