#!/bin/bash
set -e

NODE_RANGE=node22.22.2

VERSION=$(node -p -e "require('./package.json').version")

rm -rf bin dist
npx webpack

mkdir bin

# build <pkg-arch> <output-dir> [exe-extension]
build() {
  local arch="$1" outdir="$2" ext="${3:-}"

  echo "==> Building $outdir ($NODE_RANGE-$arch)"
  mkdir -p "bin/$outdir"
  npx @yao-pkg/pkg dist/index.js \
    -t "$NODE_RANGE-$arch" \
    -o "bin/$outdir/scratch-run$ext"

  ( cd "bin/$outdir" && zip "../scratch-run_${VERSION}_${outdir//-/_}.zip" "scratch-run$ext" )
}

build linux-x64    linux-amd64
build linux-arm64  linux-arm64
build macos-x64    macos-amd64
build macos-arm64  macos-arm64
build win-x64      win-amd64    .exe
build win-arm64    win-arm64    .exe
