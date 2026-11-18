package dot.paleblue.radio;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.os.PowerManager;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Pale Blue Dot Radio for Android: the radio's website in its own window. It keeps playing when the phone is locked
 * or another app is in front (the page always counts as visible, and a "now playing" service keeps the app awake),
 * the host speaks with Android's own voices, and the lock screen and headphones control it.
 * The radio itself (music, host, news, your library) comes from the website and updates by itself.
 */
public class MainActivity extends Activity {
  static final String ORIGIN = "https://yisyphus.github.io";
  static final String HOME = ORIGIN + "/pale-blue-dot/";
  static MainActivity current;

  RadioWebView web;
  TextToSpeech tts;
  boolean ttsReady;
  JavaScriptReplyProxy reply;
  ValueCallback<Uri[]> fileCallback;
  final Handler ui = new Handler(Looper.getMainLooper());

  @SuppressLint("SetJavaScriptEnabled")
  @Override protected void onCreate(Bundle saved) {
    super.onCreate(saved);
    current = this;
    web = new RadioWebView(this);
    web.setBackgroundColor(Color.parseColor("#05081a"));
    setContentView(web);

    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setSupportMultipleWindows(true);
    s.setJavaScriptCanOpenWindowsAutomatically(true);
    // Google's sign-in page refuses app windows: the app introduces itself as the phone's browser (plus its own name)
    s.setUserAgentString(s.getUserAgentString().replace("; wv)", ")").replaceAll("Version/[\\d.]+ ", "") + " PaleBlueDotApp/1");
    CookieManager.getInstance().setAcceptCookie(true);
    CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);   // the sign-in comes back through Firebase's own site
    web.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);   // stays important when not on screen

    Set<String> all = Collections.singleton("*"), radio = Collections.singleton(ORIGIN);
    if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
      WebViewCompat.addDocumentStartJavaScript(web, asset("visible.js"), all);   // the radio and YouTube's player
      if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
        WebViewCompat.addWebMessageListener(web, "PBDNative", radio, this::onMessage);   // only the radio's own page
        WebViewCompat.addDocumentStartJavaScript(web, asset("speech.js"), radio);
      }
    }

    web.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
        if (!r.isForMainFrame()) return false;
        Uri u = r.getUrl();
        if (stayInside(u)) return false;
        openOutside(u); return true;
      }
    });
    web.setWebChromeClient(new WebChromeClient() {
      @Override public void onReceivedTitle(WebView v, String title) { RadioService.setTitle(title); }
      // links the radio opens in a new window (news articles, the download sites): in the phone's browser
      @Override public boolean onCreateWindow(WebView v, boolean dialog, boolean gesture, Message msg) {
        WebView tmp = new WebView(MainActivity.this);
        tmp.setWebViewClient(new WebViewClient() {
          @Override public boolean shouldOverrideUrlLoading(WebView w, WebResourceRequest r) { openOutside(r.getUrl()); w.destroy(); return true; }
          @Override public void onPageStarted(WebView w, String url, android.graphics.Bitmap f) { if (url != null && !url.equals("about:blank")) { openOutside(Uri.parse(url)); w.stopLoading(); w.destroy(); } }
        });
        ((WebView.WebViewTransport) msg.obj).setWebView(tmp); msg.sendToTarget();
        return true;
      }
      @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        fileCallback = cb;
        try { startActivityForResult(p.createIntent(), 7); } catch (ActivityNotFoundException e) { fileCallback = null; return false; }
        return true;
      }
    });
    web.setDownloadListener((url, ua, cd, mime, len) -> openOutside(Uri.parse(url)));

    tts = new TextToSpeech(this, status -> ui.post(() -> { ttsReady = status == TextToSpeech.SUCCESS; sendVoices(); }));
    tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
      @Override public void onStart(String id) { say("start", id, null); }
      @Override public void onDone(String id) { say("end", id, null); }
      @Override public void onError(String id) { say("error", id, "synthesis-failed"); }
      @Override public void onError(String id, int code) { say("error", id, code == TextToSpeech.ERROR_NETWORK || code == TextToSpeech.ERROR_NETWORK_TIMEOUT ? "network" : "synthesis-failed"); }
      @Override public void onStop(String id, boolean interrupted) { say("error", id, interrupted ? "interrupted" : "canceled"); }
    });

    startPlaying();
    askOnce();
    if (saved == null) web.loadUrl(HOME); else web.restoreState(saved);
  }

  // ---------- the "now playing" service (keeps the app running with the screen off) ----------
  void startPlaying() {
    Intent i = new Intent(this, RadioService.class);
    startForegroundService(i);
  }

  // the first time: allow the notification (lock-screen controls), and let the radio run with the battery saver on
  void askOnce() {
    if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED)
      requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, 3);
    PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
    if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName()) && !getPreferences(MODE_PRIVATE).getBoolean("askedBattery", false)) {
      getPreferences(MODE_PRIVATE).edit().putBoolean("askedBattery", true).apply();
      try { startActivity(new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + getPackageName()))); } catch (Exception ignored) {}
    }
  }

  // play/pause, next and previous from the notification, the lock screen and headphones
  static void control(String what) {
    MainActivity a = current; if (a == null) return;
    String js;
    if ("next".equals(what)) js = "(function(){var b=document.getElementById('btnNext');if(b)b.click();})()";
    else if ("prev".equals(what)) js = "(function(){var b=document.getElementById('btnPrev');if(b)b.click();})()";
    else js = "(function(){var u=document.getElementById('tune'),t=document.getElementById('btnTune');"
        + "if(u&&t&&u.offsetParent!==null&&getComputedStyle(u).display!=='none'){t.click();return;}"
        + "var b=document.getElementById('btnPlay');if(b)b.click();})()";
    a.ui.post(() -> a.web.evaluateJavascript(js, null));
  }

  // ---------- Astro's voice: Android's text-to-speech, for the page's speechSynthesis ----------
  void onMessage(WebView v, WebMessageCompat m, Uri origin, boolean mainFrame, JavaScriptReplyProxy r) {
    if (!mainFrame || m.getData() == null) return;
    reply = r;
    try {
      JSONObject o = new JSONObject(m.getData());
      String op = o.optString("op");
      if ("hello".equals(op)) sendVoices();
      else if ("cancel".equals(op)) { if (ttsReady) tts.stop(); }
      else if ("speak".equals(op)) speak(o);
    } catch (Exception ignored) {}
  }

  void speak(JSONObject o) {
    String id = o.optString("id");
    if (!ttsReady) { say("error", id, "synthesis-unavailable"); return; }
    String name = o.optString("voice"), lang = o.optString("lang");
    Voice pick = null;
    try { for (Voice x : tts.getVoices()) if (x.getName().equals(name)) { pick = x; break; } } catch (Exception ignored) {}
    if (pick != null) tts.setVoice(pick);
    else if (!lang.isEmpty()) tts.setLanguage(Locale.forLanguageTag(lang));
    tts.setSpeechRate((float) o.optDouble("rate", 1));
    tts.setPitch((float) o.optDouble("pitch", 1));
    Bundle b = new Bundle();
    b.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, (float) o.optDouble("volume", 1));
    if (tts.speak(o.optString("text"), TextToSpeech.QUEUE_ADD, b, id) != TextToSpeech.SUCCESS) say("error", id, "synthesis-failed");
  }

  void sendVoices() {
    if (!ttsReady) return;
    try {
      List<Voice> list = new ArrayList<>();
      for (Voice x : tts.getVoices()) if (!x.getFeatures().contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) list.add(x);
      Voice def = tts.getDefaultVoice();
      String defName = def != null ? def.getName() : "";
      // the phone's own default voice of each language first, then voices that work offline
      list.sort((a, b) -> {
        int d = Boolean.compare(b.getName().equals(defName), a.getName().equals(defName)); if (d != 0) return d;
        int l = a.getLocale().toLanguageTag().compareTo(b.getLocale().toLanguageTag()); if (l != 0) return l;
        d = Boolean.compare(a.isNetworkConnectionRequired(), b.isNetworkConnectionRequired()); if (d != 0) return d;
        return a.getName().compareTo(b.getName());
      });
      JSONArray arr = new JSONArray();
      for (Voice x : list) arr.put(new JSONObject().put("name", x.getName()).put("lang", x.getLocale().toLanguageTag())
          .put("local", !x.isNetworkConnectionRequired()).put("default", x.getName().equals(defName)));
      post(new JSONObject().put("op", "voices").put("voices", arr));
    } catch (Exception ignored) {}
  }

  void say(String op, String id, String error) {
    try { JSONObject o = new JSONObject().put("op", op).put("id", id); if (error != null) o.put("error", error); post(o); } catch (Exception ignored) {}
  }

  void post(JSONObject o) {
    final String s = o.toString();
    ui.post(() -> { if (reply != null) try { reply.postMessage(s); } catch (Exception ignored) {} });
  }

  // ---------- links ----------
  static boolean stayInside(Uri u) {
    String h = u.getHost() == null ? "" : u.getHost();
    if (u.toString().startsWith(HOME)) return true;
    // Google sign-in and Firebase's sign-in page come back to the radio
    return h.equals("accounts.google.com") || h.endsWith(".firebaseapp.com") || h.equals("accounts.youtube.com")
        || (h.endsWith(".google.com") && u.getPath() != null && (u.getPath().startsWith("/signin") || u.getPath().startsWith("/o/oauth2")));
  }

  void openOutside(Uri u) {
    try { startActivity(new Intent(Intent.ACTION_VIEW, u).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); } catch (Exception ignored) {}
  }

  @Override protected void onActivityResult(int req, int res, Intent data) {
    if (req == 7 && fileCallback != null) { fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data)); fileCallback = null; return; }
    super.onActivityResult(req, res, data);
  }

  // Back: the radio's own pages go back; on the radio itself the app goes to the background and keeps playing
  @SuppressWarnings("deprecation")
  @Override public void onBackPressed() {
    String url = web.getUrl();
    if (web.canGoBack() && url != null && !url.startsWith(HOME)) web.goBack();
    else moveTaskToBack(true);
  }

  // Never pause the page when the app leaves the screen (that is what would stop the music)
  @Override protected void onPause() { super.onPause(); }
  @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

  @Override protected void onDestroy() {
    if (current == this) current = null;
    try { tts.shutdown(); } catch (Exception ignored) {}
    stopService(new Intent(this, RadioService.class));
    web.destroy();
    super.onDestroy();
  }

  String asset(String name) {
    try (InputStream in = getAssets().open(name)) {
      ByteArrayOutputStream out = new ByteArrayOutputStream(); byte[] b = new byte[8192]; int n;
      while ((n = in.read(b)) > 0) out.write(b, 0, n);
      return out.toString(StandardCharsets.UTF_8.name());
    } catch (Exception e) { return ""; }
  }
}
