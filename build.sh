#!/bin/bash
set -e

# Build standalone executables with @yao-pkg/pkg (standard mode).
#
#   ./build.sh                       build all 6 targets (cross-compile) + zip
#   ./build.sh <arch> <outdir> [ext] build a single target (binary only)
#
# CI builds one native target per runner (no cross-compile, native macOS
# signing) and zips in the workflow, so it passes args. A bare run still
# cross-compiles everything locally for convenience.

NODE_RANGE=node22.22.2

VERSION=$(node -p -e "require('./package.json').version")

rm -rf bin dist
npx webpack
mkdir -p bin

# build <pkg-arch> <output-dir> [exe-extension]
build() {
  local arch="$1" outdir="$2" ext="${3:-}"
  echo "==> Building $outdir ($NODE_RANGE-$arch)"
  mkdir -p "bin/$outdir"
  npx @yao-pkg/pkg dist/index.js -t "$NODE_RANGE-$arch" -o "bin/$outdir/scratch-run$ext"
}

# zip <output-dir> [exe-extension]
zip_target() {
  local outdir="$1" ext="${2:-}"
  ( cd "bin/$outdir" && zip "../scratch-run_${VERSION}_${outdir//-/_}.zip" "scratch-run$ext" )
}

if [ "$#" -ge 2 ]; then
  build "$1" "$2" "${3:-}"
else
  build linux-x64    linux-amd64;       zip_target linux-amd64
  build linux-arm64  linux-arm64;       zip_target linux-arm64
  build macos-x64    macos-amd64;       zip_target macos-amd64
  build macos-arm64  macos-arm64;       zip_target macos-arm64
  build win-x64      win-amd64    .exe; zip_target win-amd64 .exe
  build win-arm64    win-arm64    .exe; zip_target win-arm64 .exe
fi
