# Sledge

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Build Status](https://travis-ci.org/HackRU/sledge.svg?branch=master)](https://travis-ci.org/HackRU/sledge)

**This project is currently in development.**

**See docs/Deployment.md for HackRU deployment.**

Sledge is a real-time judging platform used for HackRU and HackHers. Sledge is
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

## Inspiration

Sledge for use in HackRU as an alternative to pen and paper judging, and to
remove some of the menial tasks of judging such as copying scores from paper,
calculating results and allocating judges to hacks. The name Sledge is derived
from a similar piece of software, [Gavel][gavel] (which we've used previously),
but Sledge takes a much different approach to judging than Gavel. While Gavel
tries to form an ordering of hacks for each judge and combine them into a single
score for each hack, Sledge has judges rate each hack with a number and the
final score is the average of each judge's score.

Additionally, Sledge supports prize categories in additional to overall ratings:
judges choose their first and second place choice for any number of superlatives
(or prize categories) which gets calculated into an overall score at the end.

[gavel]: https://github.com/anishathalye/gavel

## Installation Guide

Sledge is designed to run on Linux with nodejs 8+ and yarn 1.6+ (although you
can use npm). The easiest way to download all the dependencies is to run `yarn`
and install dependencies by seeing what fails.

We use [yarn][yarn] to manage most dependencies and you can download, install
and (if needed) build those dependencies by running `yarn` in the toplevel
directory. Building and testing are then managed with [gulp][gulp], which gets
installed in `node_modules` by yarn and can be run with `./gulp` from the
toplevel directory. See `gulpfile.js` for specific commands you can run.

[gulp]: https://github.com/gulpjs/gulp "Gulp"
[yarn]: https://github.com/yarnpkg/yarn "Yarn"

## Example Uses

This project is used for HackRU to judge hacks.

## Style Guide

See [`.editorconfig`][editorconfig] and [`tslint.json`][tslintjson] for basic
style rules. PRs must pass lint test before being merged. Be consistent with
what's already there.

[editorconfig]: .editorconfig
[tslintjson]: tslint.json

## Todo List

See [`docs/Roadmap.md`][roadmap].

[roadmap]: docs/Roadmap.md

## Links to Further docs

See the `docs` folder.

# License

See `LICENSE` file.
