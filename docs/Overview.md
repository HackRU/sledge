# Overview

This document contains some basic information about how sledge is structured,
many of the important libraries and tools used, and how these all fit together.
It is meant to be a reference to both my future self and other contributors.

## General

Sledge uses [Node.js][nodejs] and should run on the latest LTS release of node.
Before anything else, you need a node-compatible packages manager, preferably
[Yarn][yarn], although [npm][npm] and [pnpm][pnpm] should also work (see
`README.md`). Note if you don't use Yarn you won't get the benefit of the
`yarn.lock` file (although it's still a bug if it doesn't work without taking
the lockfile into account).

Most of the code is written in [TypeScript][ts], which is meant to be compiled
to Javascript before running. Additionally all CSS is compiled from [SCSS][scss]
(part of Sass), which must also be compiled before the browser can parse it.
This compilation step is handled by [Gulp][gulp], and running `gulp build` from
the toplevel will automatically build everything correctly (or fail trying)
based on the instructions in `gulpfile.js`. Config files for the TypeScript
compiler are stored in the toplevel directory, along with `tsconfig.json` which
only exists for editor support.

## Version Control

The official repository for Sledge is [github.com/HackRU/Sledge][sledge].

With few exceptions, binary blobs or other large files (for instance, images)
should not be checked into version control. An S3 bucket, whose endpoint is at
`https://sledge-site.s3.amazonaws.com/`, has been set up to handle these files.
Contact @three if you want files added to this endpoint.

## Server

The entrypoint for the server is `bin/sledge.js` which immediately passes its
arguments to `lib/index.js` (compiled from `src/index.ts`). This creates an
[Express][express] HTTP server on the chosen port and routes requests from
`/socket.io` to the [Socket.io][sio] instance, and routes all other requests to
the `public` directory. In production environments, all requests should first be
routed through [Nginx][nginx], whereas only the `/socket.io` route is sent to
the Express server, and files from `public` are served via Nginx's own (more
efficient) static routing.

All persistent data is stored with [SQLite][sqlite], a structured database,
using synchronous bindings from the [better-sqlite3][bettersqlite3] library.

## Client

The Javascript entrypoint for all pages is `public/init.js`, copied from
`static/init.js`. This defines a global function `init` which takes a module
name to initialize the page with. This file is meant to be called after the page
loads, and will first load then configure [SystemJS][systemjs], which handles
all client-side module loading, then use SystemJS to load the requested module,
and finally calls the `init()` function exported from the module.

The judging page uses react-redux based on the principles in [Redux: Usage with
React][reduxphil]. Each module of judging components should have a container
component, and the presentational components that go under them. Each module
will also have an `scss` file. A variable `pf` in the module and `$p` in the
scss will define a prefix for classes to prevent naming conflicts.

All client pages use [Bootstrap v4][bootstrap] with Bootstrap Grid. The
[reactstrap][reactstrap] library is used for Bootstrap components, and should
nearly always be used instead of specifying classes manually.

All CSS is compiled to `public/global.css` (from `src/client/global.scss`) which
includes all other SCSS files and has `@import` statements for external imports.
Since all pages share the same CSS, page-specific CSS is scoped by an id unique
to the page, for instance `#adminPage`, which represents the HTML element of the
page. All classes used by components are given a prefix specific to the
component. Components generally should not attempt to style their subcomponents.

## General Guidelines

 - Only components should use tsx. All tsx files should `import React form
   "react";`.
 - Judge components should be stateless and pass data up to the redux store.
 - Avoid implicit any in TypeScript.
 - For consistency, don't include file extensions on imported modules.
 - Server libraries should be imported and managed using Yarn, and client
   libraries by configuring `init.js` to download them from [cdnjs][cdnjs]. For
   now, only include unminified development versions (if available). Always
   specify module type (usually amd).
 - Use [Definitely Typed][definitelytyped] to find types
   for client libraries, and include them using Yarn.
 - Avoid default imports, if possible (the exception is React with tsx). For
   instance, `import * as X from Y` not `import X from Y`. Never export default.
 - Code should be formatted according to the `.editorconfig` file. See
   [editorconfig.org][editorconfig]. Code should be encoded as UTF8, but only
   use ASCII characters. For instance, write `"\u{1f603}"` instead of `"😃"`.
 - Sourcemaps, sourcemaps, sourcemaps.

[bettersqlite3]: https://github.com/JoshuaWise/better-sqlite3
[bootstrap]: https://getbootstrap.com/
[cdnjs]: https://cdnjs.com/
[definitelytyped]: https://microsoft.github.io/TypeSearch/
[editorconfig]: http://editorconfig.org/
[express]: https://expressjs.com/
[gulp]: https://gulpjs.com/
[nginx]: https://nginx.org/
[npm]: https://www.npmjs.com/
[nodejs]: https://nodejs.org/
[pnpm]: https://pnpm.js.org/
[react]: https://reactjs.org/
[reactstrap]: https://reactstrap.github.io/
[redux]: https://redux.js.org/
[reduxphil]: https://redux.js.org/basics/usage-with-react
[scss]: https://sass-lang.com/
[sledge]: https://github.com/hackru/sledge
[sio]: https://socket.io/
[sqlite]: https://www.sqlite.org/index.html
[systemjs]: https://github.com/systemjs/systemjs
[ts]: https://www.typescriptlang.org/
[yarn]: https://yarnpkg.com/
