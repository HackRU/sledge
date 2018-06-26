# Info for Architects

As any competitor knows, "winning isn't everything; it's the only thing" which
is why a judging is an incredibly important part of any hackathon. Hence, Sledge
is an important piece of software for HackRU. If you decide to work on Sledge
you will be working on a real-time judging system to collect data from judges
and calculate winners for all hacks being judged during the hackathon.

## Background

Sledge consists of a server which keeps track of hacks, collects score from
judges, allocates judges to hacks, assigns hacks to tables, etc. and a client
which makes it easy for judges to rate hacks, shows hacks, and has some
administration functions.

Sledge has gone through a number of iterations between hackathons, each of
varying success, although we are currently in the process of writing everything
in Typescript as a Node.js and React app. We've taken great strides in improving
the security and reliability of Sledge, by utilizing the type safety offered by
typescript and programming in a more clean and documented manner.

That said, there's still a lot of work to do before we're ready for the
hackathon. We're looking for architects willing to write clean well-documented
code.

## Technical Skills

Here's a brief overview of the technologies we use on the server and client. The
server: nodejs, typescript, socketio, sqlite3, nginx. The client: typescript,
socketio, systemjs, react, redux, bootstrap, scss.

We expect you'll learn most of these during development, however we prefer
someone who already knows Javascript (typescript isn't a big gap), has worked
with React and is comfortable in git.

## Development Workflow

All development will happen on the Github repo. We will follow the standard pull
request workflow common to many project on Github: develop on a fork and open a
pull request when you want your features merged into the main branch. Your pull
request will have to build, pass a linter, pass tests and be approved before it
will be merged in. The first two will be automated with Travis CI. The linter
acts as our style guide.

## Further Information

Build instructions and additional information can be found in the README and
`docs` folder. We have a channel on the HackRU team discord if you have any
additional questions.
