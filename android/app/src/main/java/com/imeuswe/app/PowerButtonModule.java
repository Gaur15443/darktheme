package com.imeuswe.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioManager;
import android.os.PowerManager;
import android.view.KeyEvent;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;

public class PowerButtonModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private BroadcastReceiver receiver;

    public PowerButtonModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "PowerButton";
    }

    @ReactMethod
    public void startListening() {
        if (receiver != null) return;

        receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();

                if (Intent.ACTION_SCREEN_OFF.equals(action)) {
                    sendEvent("PowerButton", "screen_off");
                } else if (Intent.ACTION_SCREEN_ON.equals(action)) {
                    sendEvent("PowerButton", "screen_on");
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        filter.addAction(Intent.ACTION_SCREEN_ON);

        reactContext.registerReceiver(receiver, filter);
    }

    @ReactMethod
    public void stopListening() {
        if (receiver != null) {
            reactContext.unregisterReceiver(receiver);
            receiver = null;
        }
    }

    private void sendEvent(String type, String value) {
        WritableMap params = Arguments.createMap();
        params.putString("type", type);
        params.putString("event", value);
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("HardwareButtonEvent", params);
    }
}
