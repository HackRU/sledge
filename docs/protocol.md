# Sledge Protocol

All communication between the client and server uses the protocol described
here, which runs on top of socket.io. When reading this document, you should
reference the [src/protocol/events.ts](../src/protocol/events.md) file which
includes the exact format of each event.

When a client connects to sledge, it connects on the default namespace and, if
server resources allow, the connection will be accepted and the client will be
allowed to stay connected indefinitely. The server will not send any events to
clients until they request them. Clients must first be authenticated before
sending privileged requests, such as rating a hack or adding a superlative.

Clients can be marked by the server as an admin or a particular judge, and some
events won't be processed unless the client is marked in a particular way.
Unless otherwise specified invalid responses will be replied with a
`protocol-error` and otherwise be ignored.

## Client-Server events

These are events sent from the client to the server.

### `add-hack`

Must be sent by an admin.

Adds a hack to the database.

### `add-judge`

Must be sent by an admin.

Adds a judge to the database.

### `add-superlative`

Must be sent by an admin.

Adds a superlative to the database.

### `authenticate`

Asks the server to mark the client as an admin or a particular judge, given a
`secret` with correct privileges. If the `userId` is a positive integer, the
server will attempt to mark the client as the judge with that id. A `userId` of
0 indicates an admin (full privileges). A failure to authenticate will lead to
`protocol-error` being sent back.

### `login`

Asks to generate a secret which can be used with the authenticate event. The
`judgeId` should be the id of the judge which will be associated with the code,
and `loginCode` server's global login code. If the `judgeId` is invalid a
`protocol-error` is sent back, otherwise a `login-response` is sent indicating
if the code was valid and, if so, the generated secret.

### `rate-hack`

Must be sent by an admin or a judge with id `judgeId`.

Adds a rating from 1 to 20 for how much a judge likes a particular hack.

### `rank-superlative`

Must be sent by an admin or a judge with id `judgeId`.

Adds a ranking for a judge's top two hacks for a given superlative. A `firstId`
or `secondId` of 0 indicates the judge has not chosen a first or second place.

### `subscribe-database`

Must be sent by an admin or a judge.

Asks the server to send `update-partial` and `update-full` events when the
database changes. After subscribing the client will be sent an `update-full`
event.

## Server-Client events

### `login-response`

Indicates if the login attempt was successful, and gives the corresponding
`secret` and `userId` to the judge that was requested.

### `protocol-error`

Indicates the client sent an invalid event to the server. This may mean the
client was not authorized to make the request, the data sent did match the
schema for the particular event, or the data sent did not match the state of the
server (for instance, a judge id which does not exist). The name of the original
event is sent back as `original` and a human-readable description of what went
wrong is sent as `message`.

This event exists to make debugging easier. A well-behaved client should never
be sent a `protocol-error`.

### `update-full`

Gives the client the state of all parts of the server's database the client
would need to access for judging.

### `update-partial`

Like an `update-partial`, but only a diff of what changed since the last
`update-full` or `update-partial` is sent.
