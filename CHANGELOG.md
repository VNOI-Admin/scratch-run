# scratch-run changelog

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
