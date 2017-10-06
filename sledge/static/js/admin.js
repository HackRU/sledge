//Stalk all the messages! And then tell the admins what's up.
var makeInputForAttr = function(key, value){
    return value;
}

var tabulateObject = function(object, keys){
    var htmlStr = '<tr>';
    keys.forEach(function(key) {
        htmlStr += '<td>' + makeInputForAttr(key, object[key.toLowerCase().replace(' ', '_')]) + '</td>';
    });
    return htmlStr + '</tr>';
}

var makeTableForObjs = function(objs, keys){
    var html = '<tr>';
    keys.forEach(function(key) {
        html += '<th>' + key + '</th>';
    });
    html += "</tr>";

    objs.forEach(function(o){
        html += tabulateObject(o, keys);
    });

    return html;
}

$(function (){
    const socket = io({query: 'admin=true&tok=the-hash-admin-password'});

    socket.on('connect', function(data) {
        console.log('connected, allegedly');
        console.log(data);
        socket.emit('list-judges');
        socket.emit('list-prizes');
    });

    socket.on('judges-list', function(data) {
        $('#judge-view').empty();
        judges = JSON.parse(data);
        $('#judge-view').html(makeTableForObjs(judges, ['Name', 'Email', 'Start Loc', 'End Loc', 'Curr Loc']));
        console.log(data);
    });

    socket.on('hacks-list', function(data) {
            $('#hack-view').empty();
            hacks = JSON.parse(data);
            $('#hack-view').html(makeTableForObjs(hacks, ['Name', 'Location', 'Description']));
        });

    socket.on('prizes-list', function(data) {
        $('#prize-view').empty();
        prizes = JSON.parse(data);
        $('#prize-view').html(makeTableForObjs(prizes, ['Name', 'Is Best Overall']));
    });

    $('#add-judge').click(function(){
        socket.emit('add-judge', {
            name: $('#judge-name').val(),
            email: $('#judge-email').val()
        });
    });

    $('#devpost-button').click(function(){
        socket.emit('devpost-scrape', $('#devpost-scrape').val());
    });

    socket.connect();
});
