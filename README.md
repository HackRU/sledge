# Sledge

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Build Status](https://travis-ci.org/HackRU/sledge.svg?branch=master)](https://travis-ci.org/HackRU/sledge)

Sledge is a real-time judging platform used for HackRU and HackHers. Sledge is
responsible for assigning judges to hacks, collecting ratings from judges and
calculating the overall winners and prize winners.

Sledge is built by architects on the RnD team. If you are an architect
interested in joining sledge please read [`docs/Contributing.md`][contributing].

[contributing]: docs/Contributing.md

## Quick Start

Sledge requires nodejs 11+, yarn 1+ and a complete GNU/Linux installation. See
the `docs` folder for more detailed instructions.

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
score for each hack, Sledge uses simple averaging of scores and a real-time
judge allocation system to ensure accurate ratings. Additionally, Sledge allows
hacks to apply for additional prizes.

[gavel]: https://github.com/anishathalye/gavel

# License

```
Sledge - A judging system for Hackathons
Copyright (C) 2018 The Sledge Authors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```
