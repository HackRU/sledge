//Stalk all the messages! And then tell the admins what's up.

$(function (){
    const socket = io('http://localhost/socket');

    var csrf;

    socket.on('judged', function(judgement) {
        
    });
});
