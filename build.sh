#!/bin/bash

NODE_VERSION=16.13.2

VERSION=$(node -p -e "require('./package.json').version")
BUILD_CMD="npx pkg index.js --no-bytecode --public-packages \"*\" --public"

rm -rf build && mkdir build && cd build

npx ncc build ../index.js --minify --out .
echo "(()=>require(\"text-encoding\"))();" >> index.js # Hack to force inclusion of text-encoding

# Linux amd64
$BUILD_CMD -t node"$NODE_VERSION"-linux-x64 --out-path linux-amd64
cd linux-amd64
mv index scratch-run
zip "../scratch-run_"$VERSION"_linux_amd64.zip" scratch-run
cd ..

# Linux arm64
$BUILD_CMD -t node"$NODE_VERSION"-linux-arm64 --out-path linux-arm64
cd linux-arm64
mv index scratch-run
zip "../scratch-run_"$VERSION"_linux_arm64.zip" scratch-run
cd ..

# macOS amd64
$BUILD_CMD -t node"$NODE_VERSION"-macos-x64 --out-path macos-amd64
cd macos-amd64
mv index scratch-run
zip "../scratch-run_"$VERSION"_macos_amd64.zip" scratch-run
cd ..

# macOS arm64
$BUILD_CMD -t node"$NODE_VERSION"-macos-arm64 --out-path macos-arm64
cd macos-arm64
mv index scratch-run
zip "../scratch-run_"$VERSION"_macos_arm64.zip" scratch-run
cd ..

# Windows amd64
$BUILD_CMD -t node"$NODE_VERSION"-win-x64 --out-path win-amd64
cd win-amd64
mv index.exe scratch-run.exe
zip "../scratch-run_"$VERSION"_win_amd64.zip" scratch-run.exe
cd ..

# Windows arm64
$BUILD_CMD -t node"$NODE_VERSION"-win-arm64 --out-path win-arm64
cd win-arm64
mv index.exe scratch-run.exe
zip "../scratch-run_"$VERSION"_win_arm64.zip" scratch-run.exe
cd ..
