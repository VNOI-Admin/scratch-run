# scratch-run changelog

### v0.0.11

- Use Node 16.16.0

### v0.0.10

- Use custom Queue for lines and ask_queue
- Hack to speeding up `vm.runtime._step` calls

Thank @quangloc99 for the idea and implementation.

### v0.0.9

- Use Node 16.14.2
- Block extensions (e.g., music)

### v0.0.8

- Use Node 16.13.2
- Fix bug when using block Think with a number

### v0.0.7

- Use Node 16.13.0
- Add binaries for arm64

#### v0.0.6

- Add argument `--check` for validating Scratch file but not running.

#### v0.0.5

- Do not print newline character for Think block
- Print error to stderr
- Fix error `Cannot find module 'text-encoding'`

#### v0.0.4

- Minify code with ncc before passing to pkg for compiling
- Correctly check whitespace characters (space, horizontal tab, vertical tab, form feed)

#### v0.0.3

- Disable bytecode generation

#### v0.0.2

- Switch to `readline` as `readline-sync` does not work inside sandbox.
- Default to reading line by line. To read token by token, set the question for the `Ask () and Wait` block to `read_token`.

#### v0.0.1

- Initial release
