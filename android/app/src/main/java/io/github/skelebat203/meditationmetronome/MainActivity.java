package io.github.skelebat203.meditationmetronome;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Single-screen WebView shell for the bundled web app.
 * Lockdown (0002 § Platform): bundled files only, no JavaScript-to-Android bridge, no network.
 * The bundled files are served from https://appassets.androidplatform.net/ by WebViewAssetLoader
 * (assets only, no real network). The file chooser (0005 § Picking files) hands the page the picked
 * documents as File objects; the page copies them into its own storage.
 */
public class MainActivity extends Activity {

    private static final String ASSET_PATH = "/assets/";
    private static final String ASSET_ROOT = "https://" + WebViewAssetLoader.DEFAULT_DOMAIN + ASSET_PATH + "web/";
    private static final String START_URL = ASSET_ROOT + "index.html";
    private static final int PERCENT = 100;
    private static final int REQUEST_PICK = 1;
    private static final String MIME_ANY = "*/*";
    private static final String SCHEME_CONTENT = "content";

    private WebView webView;
    private ValueCallback<Uri[]> pendingPick;

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
        s.setDomStorageEnabled(true); // saved settings use localStorage; own media uses IndexedDB
        // WebView ignores the system font size; follow it so large text works (WCAG 1.4.4).
        // fontScale is not in configChanges, so a change recreates the activity and reapplies this.
        s.setTextZoom(Math.round(getResources().getConfiguration().fontScale * PERCENT));
        // Everything on disk is closed; bundled files come through WebViewAssetLoader.
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

        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler(ASSET_PATH, new WebViewAssetLoader.AssetsPathHandler(this))
                .build();
        webView.setWebViewClient(new LocalOnlyClient(loader));
        webView.setWebChromeClient(new PickerClient());

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
        cancelPick();
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

    /** Answers a pending file chooser with "nothing picked". Every callback is answered exactly once. */
    private void cancelPick() {
        if (pendingPick != null) {
            pendingPick.onReceiveValue(null);
            pendingPick = null;
        }
    }

    /** Only the page's own accept types that are real MIME types (not extensions like ".mp3"). */
    private static String[] mimeTypes(String[] accept) {
        List<String> out = new ArrayList<>();
        for (String a : accept) {
            String type = a.trim();
            if (type.contains("/")) {
                out.add(type);
            }
        }
        return out.toArray(new String[0]);
    }

    private static Intent pickIntent(WebChromeClient.FileChooserParams params) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.putExtra(Intent.EXTRA_LOCAL_ONLY, true);
        if (params.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        }
        String[] types = mimeTypes(params.getAcceptTypes());
        if (types.length == 1) {
            intent.setType(types[0]);
        } else {
            intent.setType(MIME_ANY);
            if (types.length > 1) {
                intent.putExtra(Intent.EXTRA_MIME_TYPES, types);
            }
        }
        return intent;
    }

    /** The result is untrusted: keep only content:// URIs, and null when none are left. */
    private static Uri[] contentOnly(Uri[] uris) {
        if (uris == null) {
            return null;
        }
        List<Uri> out = new ArrayList<>();
        for (Uri u : uris) {
            if (u != null && SCHEME_CONTENT.equals(u.getScheme())) {
                out.add(u);
            }
        }
        return out.isEmpty() ? null : out.toArray(new Uri[0]);
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != REQUEST_PICK || pendingPick == null) {
            return;
        }
        Uri[] uris = resultCode == RESULT_OK ? WebChromeClient.FileChooserParams.parseResult(resultCode, data) : null;
        pendingPick.onReceiveValue(contentOnly(uris));
        pendingPick = null;
    }

    /** File inputs in the page open the system document picker (no storage permission needed). */
    private class PickerClient extends WebChromeClient {
        @Override
        @SuppressWarnings("deprecation")
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            cancelPick();
            pendingPick = callback;
            try {
                startActivityForResult(pickIntent(params), REQUEST_PICK);
            } catch (ActivityNotFoundException e) {
                cancelPick();
            }
            return true;
        }
    }

    private static boolean isLocal(String url) {
        return url.startsWith(ASSET_ROOT);
    }

    /** Blocks every navigation and request outside the bundled web files; serves those through the loader. */
    private static class LocalOnlyClient extends WebViewClient {
        private final WebViewAssetLoader loader;

        LocalOnlyClient(WebViewAssetLoader loader) {
            this.loader = loader;
        }

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
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            return isLocal(uri.toString()) ? loader.shouldInterceptRequest(uri) : blocked();
        }

        private static WebResourceResponse blocked() {
            return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
        }
    }
}
