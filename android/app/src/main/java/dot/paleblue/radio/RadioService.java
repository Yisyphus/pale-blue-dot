package dot.paleblue.radio;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.core.app.NotificationCompat;

/**
 * "Now playing": keeps the app running with the screen off (Android stops apps in the background otherwise), holds
 * the processor and the Wi-Fi awake, and shows the song with play/pause, previous and next on the notification, the
 * lock screen and headphones.
 */
public class RadioService extends Service {
  static final String CHANNEL = "radio";
  static RadioService me;
  static String title = "Pale Blue Dot Radio";

  MediaSessionCompat session;
  PowerManager.WakeLock cpu;
  WifiManager.WifiLock wifi;

  @SuppressWarnings("deprecation")
  @Override public void onCreate() {
    super.onCreate();
    me = this;
    NotificationManager nm = getSystemService(NotificationManager.class);
    NotificationChannel ch = new NotificationChannel(CHANNEL, "Now playing", NotificationManager.IMPORTANCE_LOW);
    ch.setShowBadge(false);
    nm.createNotificationChannel(ch);

    session = new MediaSessionCompat(this, "PaleBlueDot");
    session.setCallback(new MediaSessionCompat.Callback() {
      @Override public void onPlay() { MainActivity.control("toggle"); }
      @Override public void onPause() { MainActivity.control("toggle"); }
      @Override public void onSkipToNext() { MainActivity.control("next"); }
      @Override public void onSkipToPrevious() { MainActivity.control("prev"); }
    });
    session.setPlaybackState(new PlaybackStateCompat.Builder()
        .setActions(PlaybackStateCompat.ACTION_PLAY | PlaybackStateCompat.ACTION_PAUSE | PlaybackStateCompat.ACTION_PLAY_PAUSE
            | PlaybackStateCompat.ACTION_SKIP_TO_NEXT | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS)
        .setState(PlaybackStateCompat.STATE_PLAYING, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1f).build());
    session.setActive(true);
    meta();

    PowerManager pm = getSystemService(PowerManager.class);
    cpu = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "PaleBlueDot:radio");
    cpu.setReferenceCounted(false); cpu.acquire();
    WifiManager wm = (WifiManager) getApplicationContext().getSystemService(WIFI_SERVICE);
    if (wm != null) { wifi = wm.createWifiLock(WifiManager.WIFI_MODE_FULL_HIGH_PERF, "PaleBlueDot:radio"); wifi.setReferenceCounted(false); wifi.acquire(); }
  }

  @Override public int onStartCommand(Intent intent, int flags, int startId) {
    String a = intent != null ? intent.getAction() : null;
    if (a != null) MainActivity.control(a);
    if (Build.VERSION.SDK_INT >= 29) startForeground(1, build(), ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
    else startForeground(1, build());
    return START_NOT_STICKY;
  }

  PendingIntent action(String what, int code) {
    return PendingIntent.getService(this, code, new Intent(this, RadioService.class).setAction(what), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
  }

  Notification build() {
    PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP), PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    return new NotificationCompat.Builder(this, CHANNEL)
        .setSmallIcon(R.drawable.ic_note)
        .setContentTitle(title)
        .setContentText("Pale Blue Dot Radio")
        .setContentIntent(open)
        .setOngoing(true).setSilent(true).setShowWhen(false)
        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
        .addAction(R.drawable.ic_prev, "Previous", action("prev", 1))
        .addAction(R.drawable.ic_playpause, "Play or pause", action("toggle", 2))
        .addAction(R.drawable.ic_next, "Next", action("next", 3))
        .setStyle(new androidx.media.app.NotificationCompat.MediaStyle().setMediaSession(session.getSessionToken()).setShowActionsInCompactView(0, 1, 2))
        .build();
  }

  void meta() {
    session.setMetadata(new MediaMetadataCompat.Builder()
        .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
        .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, "Pale Blue Dot Radio").build());
  }

  /** The page's title is the song playing ("Title · Artist"): shown on the notification and the lock screen. */
  static void setTitle(String t) {
    if (t == null || t.isEmpty() || t.startsWith("http")) return;
    title = t;
    RadioService s = me; if (s == null) return;
    s.meta();
    s.getSystemService(NotificationManager.class).notify(1, s.build());
  }

  // swiped away from the recent apps: the radio stops
  @Override public void onTaskRemoved(Intent root) {
    MainActivity a = MainActivity.current; if (a != null) a.finish();
    stopSelf();
  }

  @Override public void onDestroy() {
    if (me == this) me = null;
    try { if (cpu != null && cpu.isHeld()) cpu.release(); } catch (Exception ignored) {}
    try { if (wifi != null && wifi.isHeld()) wifi.release(); } catch (Exception ignored) {}
    try { session.setActive(false); session.release(); } catch (Exception ignored) {}
    super.onDestroy();
  }

  @Override public IBinder onBind(Intent i) { return null; }
}
