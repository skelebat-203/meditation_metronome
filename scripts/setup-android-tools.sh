#!/usr/bin/env bash
# Installs the Android build tools (JDK, Android SDK) into .tools/ at the main checkout root.
# Dev-only; not part of the app. Idempotent: re-running skips what is already installed.
# Worktrees share the main checkout's .tools/. No sudo, nothing outside .tools/.
set -euo pipefail

JDK_VERSION="17.0.21+9"
JDK_URL="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.21%2B9/OpenJDK17U-jdk_x64_linux_hotspot_17.0.21_9.tar.gz"
JDK_SHA256="8b9b611d917e3dfd8419d3566b5949226f69b052fed7e109c1368add1dfe8711"

CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-16111833_latest.zip"
# Google publishes only SHA-1 for this build (repository2-3.xml). This SHA-256 was computed from a
# download that passed that SHA-1 check, and is pinned here instead.
CMDLINE_TOOLS_SHA256="0877a1d048fe4a24efe2eff536ca4223f7adeb58648bb81909d33c446918cfa8"

# sdkmanager verifies these packages' checksums itself.
SDK_PACKAGES=("platform-tools" "build-tools;35.0.0" "platforms;android-35")

# The main checkout is the parent of the shared git dir, so worktrees resolve to the same place.
MAIN_ROOT="$(cd "$(dirname "$(git -C "$(dirname "$0")" rev-parse --path-format=absolute --git-common-dir)")" && pwd)"
TOOLS="$MAIN_ROOT/.tools"
JAVA_HOME="$TOOLS/jdk"
ANDROID_HOME="$TOOLS/android-sdk"
# Keep the SDK's per-user files (and its CLI cache) in .tools/, not ~/.android.
ANDROID_USER_HOME="$TOOLS/android-user"
export JAVA_HOME ANDROID_HOME ANDROID_USER_HOME
mkdir -p "$TOOLS"
TMP="$(mktemp -d "$TOOLS/download.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

if [ ! -x "$JAVA_HOME/bin/java" ]; then
  echo "Installing JDK $JDK_VERSION"
  curl -fL --proto '=https' -o "$TMP/jdk.tar.gz" "$JDK_URL"
  echo "$JDK_SHA256  $TMP/jdk.tar.gz" | sha256sum -c -
  mkdir -p "$TMP/jdk" && tar -xzf "$TMP/jdk.tar.gz" -C "$TMP/jdk" --strip-components=1
  mv "$TMP/jdk" "$JAVA_HOME"
fi

SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
if [ ! -x "$SDKMANAGER" ]; then
  echo "Installing Android command-line tools"
  curl -fL --proto '=https' -o "$TMP/cmdline-tools.zip" "$CMDLINE_TOOLS_URL"
  echo "$CMDLINE_TOOLS_SHA256  $TMP/cmdline-tools.zip" | sha256sum -c -
  unzip -q "$TMP/cmdline-tools.zip" -d "$TMP"
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  mv "$TMP/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
fi

# Usage metrics stay off (the CLI defaults to not opted in). No license prompt with this sdkmanager.
"$SDKMANAGER" --install "${SDK_PACKAGES[@]}" < /dev/null
"$SDKMANAGER" --list_installed < /dev/null
