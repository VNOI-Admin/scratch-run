#!/bin/bash

NODE_VERSION=20.10.0
NODE_DIST_URL=https://nodejs.org/dist/v"$NODE_VERSION"/node-v"$NODE_VERSION"

VERSION=$(node -p -e "require('./package.json').version")

rm -rf bin dist
npx webpack

mkdir bin
cd bin
node --experimental-sea-config ../sea-config.json

build_unix() {
  NODE_ARCH=$1
  TARGET=$2
  IS_MACOS=$3

  echo "Building $TARGET"

  URL="$NODE_DIST_URL"-"$NODE_ARCH".tar.xz
  echo "Downloading $URL"
  curl "$URL" -o "$NODE_ARCH".tar.xz
  tar -xf "$NODE_ARCH".tar.xz
  rm "$NODE_ARCH".tar.xz

  mkdir "$TARGET"
  mv node-v"$NODE_VERSION"-"$NODE_ARCH"/bin/node "$TARGET"/scratch-run
  rm -rf node-v"$NODE_VERSION"-"$NODE_ARCH"

  cd "$TARGET"
  if [ "$IS_MACOS" = true ] ; then
    npx postject scratch-run NODE_SEA_BLOB ../blob.blob \
      --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
      --macho-segment-name NODE_SEA
    ldid -Cadhoc -S scratch-run
  else
    npx postject scratch-run NODE_SEA_BLOB ../blob.blob \
      --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2
  fi

  zip "../scratch-run_"$VERSION"_"$TARGET".zip" scratch-run
  cd ..
}

build_win() {
  NODE_ARCH=$1
  TARGET=$2

  echo "Building $TARGET"

  URL="$NODE_DIST_URL"-"$NODE_ARCH".zip
  echo "Downloading $URL"
  curl "$URL" -o "$NODE_ARCH".zip
  unzip -q "$NODE_ARCH".zip
  rm "$NODE_ARCH".zip

  mkdir "$TARGET"
  mv node-v"$NODE_VERSION"-"$NODE_ARCH"/node.exe "$TARGET"/scratch-run.exe
  rm -rf node-v"$NODE_VERSION"-"$NODE_ARCH"

  cd "$TARGET"
  npx postject scratch-run.exe NODE_SEA_BLOB ../blob.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

  zip "../scratch-run_"$VERSION"_"$TARGET".zip" scratch-run.exe
  cd ..
}

# Linux amd64
build_unix "linux-x64" "linux-amd64" false

# Linux arm64
build_unix "linux-arm64" "linux-arm64" false

# macOS amd64
build_unix "darwin-x64" "macos-amd64" true

# macOS arm64
build_unix "darwin-arm64" "macos-arm64" true

# Windows amd64
build_win "win-x64" "win-amd64"

# Windows arm64
build_win "win-arm64" "win-arm64"
