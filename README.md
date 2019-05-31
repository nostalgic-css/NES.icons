NES.icons is an **NES-style (8bit-like)** icon library.

[![Gitter][gitter-badge]][gitter] [![Commitizen friendly][commitizen-badge]][commitizen]

## Installation

### Styles

NES.icons is available via either npm, Yarn, or CDN.

#### via package manager

```shell
npm install nes.icons
# or
yarn add nes.icons
```

Our `package.json` contains some additional metadata under the following keys:
* `sass` - path to our main Sass source file
* `style` - path to our non-minified CSS

#### via CDN

Import the CSS via a `<link />` element:

```html
<!-- latest -->
<link href="https://unpkg.com/nes.icons@latest/css/nes.min.css" rel="stylesheet" />
<!-- specific version -->
<link href="https://unpkg.com/nes.icons@<VERSION>/css/nes.min.css" rel="stylesheet" />
```

## Usage

NES.css only provides components. You will need to define your own layout.

The recommended font for NES.css is [Press Start 2P][press-start-2p-font]. However, [Press Start 2P][press-start-2p-font] only supports English characters. When you're using this framework with any language other than English, please use another font. Follow the Google Fonts [instructions][google-fonts-guide] about how to include them, or simply include it as below:

```html
<head>
    <link href="https://unpkg.com/nes.icons/css/nes-icons.css" rel="stylesheet" />
</head>
```

Then use any of the icons in your project!


```html
<i class="nes-icon nes-icon-eye"></i>
<i class="nes-icon nes-icon-eye-slash"></i>
<i class="nes-icon nes-icon-discord"></i>
```

## Browser Support

NES.css is compatible with the newest version of the following browsers:
* Chrome
* Firefox
* Safari

Untested
* IE/Edge

## Copyright and license

Code and documentation copyright 2019 [Trezy.com][trezy.com]. Code released under the MIT License. Docs released under Creative Commons.

## Development

If you'd like to help us out with the project, we welcome contributions of all types! Check out our [`CONTRIBUTING.md`][contributing-document] for more details on how you can help make NES.css amazing!





[commitizen]: http://commitizen.github.io/cz-cli/
[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[contributing-document]: CONTRIBUTING.md
[gitter]: https://gitter.im/nostalgic-css/Lobby
[gitter-badge]: https://img.shields.io/gitter/room/nostalgic-css/Lobby.svg
[trezy.com]: https://trezy.com
