# Sledge

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Build Status](https://travis-ci.org/HackRU/sledge.svg?branch=master)](https://travis-ci.org/HackRU/sledge)

**This project is currently in development.**

Sledge is the judging platform used for HackRU and HackHers. Sledge is
responsible for assigning judges to hacks, collecting ratings from judges and
calculating the overall winners and prize winners.

Sledge is built by architects on the RnD team. If you are an architect
interested in joining sledge please read [`docs/Architects.md`][architects].

[architects]: docs/Architects.md

## Quick Start

```
$ git clone https://github.com/HackRU/sledge.git && cd sledge
$ yarn install
$ ./gulp start
```

## Building and Running Sledge

Sledge is designed to run on linux. Before running sledge, you should have
nodejs 8+ and yarn 1.6+. Certain dependencies installed by yarn use node-gyp,
which may require you to have additional system dependencies (these can be
installed as needed by seeing what fails).

We use [yarn][yarn] to manage library dependencies that are installed locally.
Running `yarn` in the toplevel of your sledge installation will automatically
download, build (if needed) and locally install dependencies. Using npm *should*
also work, but keep in mind npm will not take into account yarn's lock file.

After downloading dependencies, build tasks are managed by [gulp][gulp]. For
convenience, `./gulp` will forward its arguments to the locally installed gulp
so you don't have to install gulp globally. A full list of build tasks can be
found with `./gulp -T`. Of importance, `build` builds the entire project and
`start` builds then runs the server.

[gulp]: https://github.com/gulpjs/gulp "Gulp"
[yarn]: https://github.com/yarnpkg/yarn "Yarn"

## Directory Structure

```
sledge
├── bin           Contains the sledge.js executable
├── src           Typescript source files
│   ├── client      Client source files
│   ├── protocol    Files relating to protocol (shared with client and server)
│   └── server      Server source files
├── static        Public files which are not compiled
│
├── data          Persistent data and configuration (eg database)
├── lib           Compiled server files
└── public        Public files, including static and compiled
    ├── lib         Compiled client files
    └── src         Original contents of src directory
```

# License

See `LICENSE` file.
