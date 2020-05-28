# Client Server Communication

All communication between the client and the server happens over
[socket.io][sio], which provides a really simple interface to send messages
between the client and server.

[sio]: https://socket.io/

The basic interface of socket.io is to let you send messages with a name and
a JSON-serializable object.

```js
// Send a message to the server
clientSocket.emit("hello", {
    message: "Hello World!"
});

// The server can listen for the message and send a response
serverSocketIoInstance.on("connection", socket => {
    socket.on("hello", obj => {
        serverSocketIoInstance.to(socket.sid).emit("response", {
            message: `You said: ${obj.message}`
        });
    });
});
```

We use socket.io because its widely used, well-tested and easy to setup, but
most of the code doesn't use it directly. Instead, we limit ourselves to
three types of events: `request`, `response` and `update`.

Requests and responses work together and provide an API similar to an HTTP
request. Request events only happen from the client to the server and are
objects that always contain a string property `requestId` chosen by the
client. The client is guaranteed to get a response object with the same
`requestId` string as sent by the client. For some requests this will just be
`{ success: true }` but a lot of requests have more complicated response
 types. A response event will only happen from server to client.

Even though the data is sent over the same socketio event name, there are
different types of requests determined by the `requestName` property on the
object sent. The server chooses a request object to handle the request based
on this string and dispatches the event to the correct request object.
 
There are no update events in the codebase anymore but the corresponding
code remains in case it becomes useful later. An update is a message always
from the server to the client, that gets sent to all connected clients. This
is useful since the request/response model only allows the server to send
information to the client after receiving a request.

To simplify everything, we try to make messages [stateless][sl], meaning
everything needed to handle a request, response or update is in the sent object
itself. This means, for instance, a connected client is not associated with
a specific judge and which judge to perform an action on (or, back when
clients were authenticated as a specific judge, the information needed to
authenticate that judge) needs to be sent with the request.

[sl]: https://en.wikipedia.org/wiki/Stateless_protocol

If a request encounters a problem the response will contain an `error`
property with a string describing what went wrong. This error property is
checked in a few places and the object won't necessarily be passed through if
this property exists. You shouldn't use the error property for problems the
client knows how to recover from.

Specifically for a `request` there's a special type of "validation" error
that's always checked for to ensure the object has the right "shape". For
instance, that if a specific property is expected to be a list of positive
integers, then it meets that requirement. The reason this is separated out
(instead of say, just checking each number is a positive integer as we use the
object) is it's easier to write the handle methods if we can safely cast it
to that type in typescript. This is only done for `request` because we only care
about handling bad data sent to the server, because a server issue is a bigger
concern. The clients can always assume data given to them by the server is
properly typed.

At a higher level, if a client is connected to the server (using a
`Socket` object, defined in`client/Socket.ts`), they can use the `sendRequest`
function. This returns a [promise][jsp] giving the response. The caller is
responsible for ensuring the request is of the correct form and casting the
response to the correct type, but all the other details are handled.

[jsp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

```js
socket.sendRequest({
    requestName: "REQUEST_DO_SOMETHING",
    extraData: ["do", "something"]
}).then( (responseObject: DoSomethingResponseData) => {
    console.log("Got an object as a response", responseObject);
});
```

For the most part, the socket object is treated as a singleton can be
retrieved with `getSocket()` defined in `client/Socket.ts`. Beware in a lot
of code this change isn't completely implemented, but also note having
multiple `Socket` objects on a client doens't actually cause problems
(though should be frowned upon).

The server is a bit more complicated. To create a request that can be
responded to you need to create a class implementing `Request` (defined in
`server/Request.ts`) and instantiate it in the constructor of `EventHandler`. If
there are any types or data you want to share between the client and the
server, a corresponding file should be created in the `shared` directory (where
both the client and server will have access to it).
