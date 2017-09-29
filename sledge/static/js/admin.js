//Stalk all the messages! And then tell the admins what's up.

var makeInputForAttr = function(attr, value){
    return '<input type="text" value="' + value + '" class="judge-input" data-obj-attr="' + attr + '"></input>';
}

var tabulateObject = function(object){
    var htmlStr = '';
    Object.keys(object).forEach(function(key) {
        htmlStr += key + ':' + makeInputForAttr(key, object[key]) + '<br/>';
    });
    return htmlStr;
}

$(function (){
    const socket = io('http://localhost', {query: 'admin=true&tok=the-hash-admin-password'});

    socket.on('connect', function(data) {
        console.log('connected, allegedly');
        console.log(data);
        socket.emit('list-judges');
        socket.emit('list-prizes');
    });

    socket.on('judges-list', function(data) {
        $('#judge-view').empty();
        judges = JSON.parse(data);
        judges.forEach(function(judge){
            $('#judge-view').append(tabulateObject(judge));
        });
        console.log(data);
    });

    socket.on('prizes-list', function(data) {
        $('#prize-view').empty();
        prizes = JSON.parse(data);
        prizes.forEach(function(prize){
            $('#prize-view').append(tabulateObject(prize));
        });
    });

    $('#add-judge').click(function(){
        socket.emit('add-judge', {
            name: $('#judge-name').val(),
            email: $('#judge-email').val()
        });
    });

    socket.connect();
});
