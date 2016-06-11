# tern-jsx

Add JSX support to Tern.

Makes the Tern parser aware of JSX via [`acorn-jsx`][].  This increases the
likelihood of finding definitions / documentation and renaming variables, and
improves other plugins' compatibility with JSX.

[`acorn-jsx`]: https://github.com/RReverser/acorn-jsx

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
