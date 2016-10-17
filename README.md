# Javascript ES6 Gulp Init Package for Prototyping

An init package *(you could view it as an boilerplate, but that would be an over-simplification)* to get you up and running **fast** with a clean environment to prototype with javascript.

It's meant to build simple code / figuring out how things work as opposed to building web applications (although it features a web server for all your in-browser needs).

## Tell

Features:
- ES6 Syntax transpiling w/ [stage-0](https://babeljs.io/docs/plugins/preset-stage-0/)

## Tech stack

### Gulp

Task runner and orchestrator (well, there's npm...) of various services (transpiling, http server, file watcher, ...).

More info: [gulpjs.com](http://gulpjs.com/)

### Del

Clean the environment before transpiling / re-transpiling files.

More info: [github.com/sindresorhus/del](https://github.com/sindresorhus/del)

### Babel

Used to tranpile javascript files. It contains the following presets:
- es2015 - [https://babeljs.io/docs/plugins/preset-es2015/](https://babeljs.io/docs/plugins/preset-es2015/)
- stage-0 - [https://babeljs.io/docs/plugins/preset-stage-0/](https://babeljs.io/docs/plugins/preset-stage-0/)

## Requirements

- **Node.js** - Either node version works [`4.x`](https://nodejs.org/en/download/) or [`6.x`](https://nodejs.org/en/download/current/), but the `4.x` version will spit out an excessive amount of warnings (some packages are only maintained for node `6.x`+).
- **Git** - Either version is fine for this project, but if you can trick your package manager into installing the [latest](https://git-scm.com/downloads) one, that would be super.

## Roadmap

- Generator -> should generate all required files and link them in package.json
- Generator -> should be interactive

## Contributing

We welcome contributions of every form, shape or size. Just have a gander at [CONTRIBUTING.MD](./CONTRIBUTING.MD) to figure out how to get started.

## License

See [LICENSE](./LICENSE)
