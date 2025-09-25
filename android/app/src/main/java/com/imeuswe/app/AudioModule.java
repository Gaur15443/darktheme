package com.imeuswe.app;

import android.content.Context;
import android.media.AudioManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AudioModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public AudioModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return "BluetoothModule"; // <-- Name used in JS
    }

    @ReactMethod
    public void configureAudioForCall(Promise promise) {
        try {
            AudioManager audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
            if (audioManager != null) {
                audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
                audioManager.setSpeakerphoneOn(false);
                promise.resolve("Audio configured for call");
            } else {
                promise.reject("AUDIO_MANAGER_NULL", "AudioManager is null");
            }
        } catch (Exception e) {
            promise.reject("AUDIO_CONFIG_ERROR", "Failed to configure audio: " + e.getMessage());
        }
    }

    @ReactMethod
    public void resetAudioSession(Promise promise) {
        try {
            AudioManager audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
            if (audioManager != null) {
                audioManager.setMode(AudioManager.MODE_NORMAL);
                promise.resolve("Audio session reset");
            } else {
                promise.reject("AUDIO_MANAGER_NULL", "AudioManager is null");
            }
        } catch (Exception e) {
            promise.reject("AUDIO_RESET_ERROR", "Failed to reset audio: " + e.getMessage());
        }
    }
}
