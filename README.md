# muski-synth-genie

Drawing-baseed synth powered by Magenta's Piano Genie model for the MusKI website.

## Installation

Install the package via `npm`:

```shell
npm install <package-name>
```

## Usage

Take a look at the `docs` and `src` folders.

## Build

Install the dependencies:

```shell
npm install
```

Build the redistributable files to the `dist` folder using

```shell
npm run build
```

or start a development server using

```shell
npm run serve
```

Before sending any pull requests, your changes should be properly formatted
using

```shell
npm run format
```

and the linter should not have any complaints:

```shell
npm run lint
```

Check out `package.json` for additional `run` scripts.

This project is using Parcel as a build system. The demo is written in HTML,
SCSS and Typescript.

## Credits

Based on Piano Genie, created by Chris Donahue, Ian Simon, Sander Dieleman and part of the 
[Google Magenta project](https://magenta.tensorflow.org/).

Developed by Christian Stussak for IMAGINARY gGmbH.

## License

Piano Genie:
Copyright 2018 Google Inc. All Rights Reserved.

Modifications:
Copyright 2023 IMAGINARY gGmbH.

Licensed under the Apache License (see LICENSE).
