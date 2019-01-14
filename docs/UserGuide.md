# User Guide

## Introduction

Sledge is a judging system designed for hackathons but general enough to be used
for other events. The goal of Sledge is to display results in real time to
organizers and to allow adjustment to be made on the fly. Additionally our goal
is to make Sledge easy and cheap to deploy, easy to teach to judges, and have
the data be easily analyzed with software outside of Sledge.

As of the writing of this documentation, Sledge should be thought of as alpha
software. Although it is usable, expect bugs and expect to spend some time
figuring things out.

## Requirements

Sledge is designed to run on GNU/Linux, with the latest nodejs (v11), the latest
yarn (v1). GNU Make is required for building, as well as standard system build
tools needed by node-gyp. You will also need git if you are obtaining the source
from the repository.

## Getting Sledge

The source for Sledge can be obtained via git from our official repository.

```
git clone https://github.com/HackRU/sledge.git
```

The latest reviewed version of the code can be found on `master`. Alternatively,
you can [download the source as a zip archive][sledge-zip].

Currently we do not have the option to download prebuilt versions of Sledge.

[sledge-zip]: https://github.com/HackRU/sledge/archive/master.zip

## Building and Running

First you must obtain and build node dependencies, then the build process can be
run using make. Once Sledge is built use the cli found in `bin` to start the
server. A full list of cli options can be found with the `--help` flag. The
following should be run from the directory you extracted or cloned Sledge into.

```
yarn install
make build
./bin/sledge --port 8080
```

Sledge will now be running on `http://localhost:8080/`. Please read the
deployment recommendations section if you are running Sledge for use at
actual hackathons.

## How to Use

### Setting Up

(todo)

### For Admins

(todo)

### For Judges

(todo)

## Deployment Recommendations

We recommend running Sledge on hardware with at least two logical processors and
at least 1GB of RAM. In the past we have used the 60GB tier VC2 from Vultr,
which provides two vCPUs. Ideally Sledge should be run on its own instance.

To reduce the load on the sledge app, the server should be placed behind a
reverse proxy such as nginx and only socket requests on the `/socket.io` route
be handled by node. Static content found in the `public` directory after
building should be handled separately. Additionally a reverse proxy is necessary
for HTTPS.

Sledge outputs logs to stderr depending on the value of `DEBUG`. For instance,
this can be set to `sledge` to only produce logs from sledge, or `*` to produce
logs for dependencies such as socket.io or express. Since logging output is not
automatically saved you may want to use a tool, such as creating a systemd
service, to do this.

See the `tools` directory for scripts which can deploy Sledge to give you an
idea of what these suggestions look like in practice.
