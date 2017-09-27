// This page will handle the rendering based on the sockets and user state

$(function () {
    const socket = io('http://localhost');

    var csrf;

    socket.on('connect', function(data) {
        console.log('connected, allegedly');
        console.log(data);
    });

    socket.on('judged', function(judgement) {
        
    });

    socket.connect();
    console.log("here!");
});
