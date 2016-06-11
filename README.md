# tern-jsx

Add JSX support to Tern.

Makes the Tern parser aware of JSX via [`acorn-jsx`][].  This increases the
likelihood of finding definitions / documentation and renaming variables, and
improves other plugins' compatibility with JSX.

[`acorn-jsx`]: https://github.com/RReverser/acorn-jsx

## Requirements

Requires a version of Tern after commit [b4bd2fc][] (i.e., `> 0.18.0`), as Acorn
must be up-to-date for this plugin to work correctly.

[b4bd2fc]: https://github.com/ternjs/tern/commit/b4bd2fcd9fc62dba18d982f84b31ccbb4273a31b

## Installation

Install the npm package globally:

`npm i -g tern-jsx`

Enable the plugin in `.tern-project`:

```json
{
  "plugins": {
    "jsx": {}
  }
}
```
