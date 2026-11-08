package io.github.skelebat203.meditationmetronome;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;

/**
 * Single-screen WebView shell for the bundled web app.
 * Lockdown (0002 § Platform): bundled files only, no JavaScript-to-Android bridge, no network.
 */
public class MainActivity extends Activity {

    private static final String ASSET_ROOT = "file:///android_asset/web/";
    private static final String START_URL = ASSET_ROOT + "index.html";

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        // Same color as the splash and the page, so there is no white flash while loading.
        webView.setBackgroundColor(getResources().getColor(R.color.app_background));
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true); // saved settings use localStorage
        // Assets stay readable via file:///android_asset; everything else on disk is closed.
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setGeolocationEnabled(false);
        s.setSupportMultipleWindows(false);
        s.setJavaScriptCanOpenWindowsAutomatically(false);
        // Media only ever starts from the Start button; later track changes and chimes
        // run on timers, so they must not need a fresh gesture.
        s.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new LocalOnlyClient());

        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(START_URL);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        webView.destroy();
        super.onDestroy();
    }

    // The web app uses history for its screens; Back walks it, then leaves the app.
    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    private static boolean isLocal(String url) {
        return url.startsWith(ASSET_ROOT);
    }

    /** Blocks every navigation and request outside the bundled web files. */
    private static class LocalOnlyClient extends WebViewClient {
        @Override
        @SuppressWarnings("deprecation")
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return !isLocal(url);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return !isLocal(request.getUrl().toString());
        }

        @Override
        @SuppressWarnings("deprecation")
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            return isLocal(url) ? null : blocked();
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            return isLocal(request.getUrl().toString()) ? null : blocked();
        }

        private static WebResourceResponse blocked() {
            return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
        }
    }
}
