# Sledge

Sledge is the judging platform used for HackRU.

## Quick Start

```
$ git clone https://github.com/HackRU/sledge.git && cd sledge
$ yarn install
$ ./runtask.sh start
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
convenience, `./runtask.sh` will forward its arguments to the locally installed
gulp so you don't have to install gulp globally. A full list of build tasks can
be found with `./runtask.sh -T`. Of importance, `build` builds the entire
project and `start` builds then runs the server.

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
```

# License

See `LICENSE` file.

[0]: https://github.com/anishathalye/gavel "Gavel"
