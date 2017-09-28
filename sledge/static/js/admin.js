//Stalk all the messages! And then tell the admins what's up.

$(function (){
    const socket = io('http://localhost', {query: 'admin=true&tok=rigved'});

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
