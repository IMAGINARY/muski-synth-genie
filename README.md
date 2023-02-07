# muski-synth-genie

Drawing-based synth powered by Magenta's Piano Genie model for the MusKI
website.

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

This project is using Parcel as a build system. It is written in HTML, SCSS and
Typescript.

## Credits

Developed by Christian Stussak for IMAGINARY gGmbH.

This app utilizes the Piano Genie model, which is part of the
[Google Magenta project](https://magenta.tensorflow.org/) and created by Chris
Donahue, Ian Simon, Sander Dieleman.

## License

Copyright 2023 IMAGINARY gGmbH.

Licensed under the Apache-2.0 License (see [`LICENSE`](LICENSE)).
