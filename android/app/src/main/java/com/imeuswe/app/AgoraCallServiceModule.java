package com.imeuswe.app;

import android.content.Intent;
import android.os.Build;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AgoraCallServiceModule extends ReactContextBaseJavaModule{
    private final ReactApplicationContext reactContext;

    public AgoraCallServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "AgoraCallService";
    }

    @ReactMethod
    public void startCallService(String title, String contentText) {
        Intent serviceIntent = new Intent(reactContext, AgoraCallService.class);
        serviceIntent.putExtra("notificationTitle", title);
        serviceIntent.putExtra("notificationContent", contentText);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(serviceIntent);
        } else {
            reactContext.startService(serviceIntent);
        }
    }

    @ReactMethod
    public void stopCallService() {
        Intent serviceIntent = new Intent(reactContext, AgoraCallService.class);
        reactContext.stopService(serviceIntent);
    }

}
