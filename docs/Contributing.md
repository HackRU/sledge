# Contributing

Sledge is developed by members of the HackRU Research and Development Team. If
you are a Rutgers student and want to join RnD try emailing
[rnd@hackru.org][rnd-email]. Although we are not accepting outside pull requests
right now if you have contributions you would like to share, try emailing them
to [eric@threedot14.com][eric-email].

[rnd-email]: mailto:rnd@hackru.org
[eric-email]: mailto:eric@threedot14.com

## Technical Skills

Here's a brief overview of the technologies we use on the server and client. The
server: nodejs, typescript, socketio, sqlite3, nginx. The client: typescript,
socketio, systemjs, react, redux, bootstrap, scss.

We expect you'll learn most of these during development, however we prefer
someone who already knows Javascript (typescript isn't a big gap), has worked
with React and is comfortable in git.

## Sending Contributions

Sledge uses pull requests for contributions. You can either develop on a fork or
within a branch on the main repo. Pull requests with failing tests will not be
merged. Make sure to include a description of what your PR does and reference
any related issues (if there are any). In general, follow common PR etiquette.

If you have contributed any code in master you are entitled to have your name in
the `AUTHORS` file. This should be done in its own PR after we accept your
contributions.

## Code Guidelines

We use `tslint.json` and `.editorconfig` files to help enforce these
guidelines, however you should try to follow these anyway. If are unsure of
how to style something look through the code for something similar so we stay
consistent.

With the exception of some glue code, Sledge should be thought of as programmed
in an object-oriented style that tries to be functional when it can. Each file
represents a class where static methods and types are defined at the top level
and the class itself shares the name of the file. Files that don't define a
class should be thought of as the equivalent of a class with only static
methods. To keep things simple, we keep classes as shallow as possible, that is
avoid sub-classing unless we're extending a library.

We try to keep things functional (ie functional style) by using static methods
where we can. By default, you can assume all static functions are pure; they
don't access state not passed to them and they receive and return immutable
objects. This means we don't need to worry whether the value we return will ever
change, but it also means we must be careful not to pass objects that could
change. Since this behaviour isn't always what we need functions that don't
adhere to this should be well-documented. Across all your code make explicitness
a priority. Avoid globals at all costs, and instead have anything needed
explicitly passed in to whatever function or class you're writing.

To ensure correctness make liberal use of Typescript and try to define your
types so TS can help you as much as possible. Don't overcomplicate things to the
point where the types themselves start becoming buggy, but do avoid untyped
variables as much as possible.

Most importantly, be consistent with what's already there. Different parts of
the code have developed different styles to match the libraries they work with.
That said, some code is incredibly bad and lacks any style at all and should be
rewritten to be more in line with style guidelines.

## Structure

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
    └── src         Original contents of src directory
```

The entry point for the server is `src/index.ts` which is called from the main
executable `bin/sledge.js` immediately upon starting. There is only one HTML
page `static/index.html` and correct React component is mounted based on the
location hash. All communication between server and client, beside serving
static content is done through socket.io which routed to on `/socket.io`.

## Tests

We use mocha for unit tests and both the client and server. Use `make test` to
run both client and server tests. When testing the server we look for
`*.test.ts` files (after they're compiled into js), and on the client all files
to test must be listed in an array in `static/testrunner.js`.

Because the tools to test the client involve opening a headless browser your
machine will probably need a bunch of dependencies that are difficult to track
down. The easiest way is probably to install Chromium whose dependencies will
likely be a superset of what is needed.
