package com.imeuswe.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class AgoraCallService extends Service {
    private String notificationTitle = "Call in Progress";
    private String notificationContent = "Tap to return to call";
    private static final int NOTIFICATION_ID = 1001;
    private static final String CHANNEL_ID = "AgoraVoiceCall";

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel();
        }
        Log.d("AgoraCallService", "Service Created");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            if (intent.hasExtra("notificationTitle")) {
                notificationTitle = intent.getStringExtra("notificationTitle");
            }
            if (intent.hasExtra("notificationContent")) {
                notificationContent = intent.getStringExtra("notificationContent");
            }
        }
        Log.d("AgoraCallService", "Service Started");
        startForeground(NOTIFICATION_ID, createNotification());

        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Voice Call Service",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Running voice call in background");
            channel.setSound(null, null);
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(notificationTitle)
                .setContentText(notificationContent)
                .setSmallIcon(R.mipmap.ic_notification)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setContentIntent(pendingIntent)
                .setOngoing(true);

        return builder.build();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d("AgoraCallService", "Service Destroyed");
        stopForeground(true); 
    }
}
