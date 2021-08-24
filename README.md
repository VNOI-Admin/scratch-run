# scratch-run [![Build Status](https://github.com/VNOI-Admin/scratch-run/actions/workflows/main.yml/badge.svg)](https://github.com/VNOI-Admin/scratch-run/actions/)

scratch-run is an CLI interpreter for Scratch based on [scratch-vm](https://github.com/LLK/scratch-vm).

scratch-run was created to help judging solutions written in Scratch. It is used mainly in our official online judge [VNOJ](https://github.com/VNOI-Admin/OJ), but it can also be used separately.

scratch-run is written in Node.js and packed with [pkg](https://github.com/vercel/pkg). No dependencies are required for running.

## Installation

Prebuilt binaries are available in [Releases](https://github.com/VNOI-Admin/scratch-run/releases).

## Usage

```bash
scratch-run [scratch file]
```

For example:

```bash
scratch-run tests/echo.sb3
```

Type in something and it will be echoed back!

## Build Instructions

You need Node.js and npm to build.

```bash
git clone https://github.com/VNOI-Admin/scratch-run.git
cd scratch-run
npm install
./build.sh
```

Built binaries will be saved in `build` directory.
