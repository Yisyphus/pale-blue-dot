package dot.paleblue.radio;

import android.content.Context;
import android.view.View;
import android.webkit.WebView;

/** The radio's page. It is told it is always on screen, so locking the phone or switching apps never pauses it. */
public class RadioWebView extends WebView {
  public RadioWebView(Context c) { super(c); }

  @Override protected void onWindowVisibilityChanged(int visibility) {
    super.onWindowVisibilityChanged(View.VISIBLE);
  }

  @Override protected void onVisibilityChanged(View changedView, int visibility) {
    super.onVisibilityChanged(changedView, View.VISIBLE);
  }
}
