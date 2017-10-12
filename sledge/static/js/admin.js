//Stalk all the messages! And then tell the admins what's up.
var makeInputForAttr = function(key, value){
    return value;
}

var sortRatedHacks = function(hacks){
    var aggregated = groupBy(hacks, function(rating){
        return rating.hack_id;
    });
    var summed = [];
    Object.keys(aggregated).map(function(hack_id){
        var innerSum = sum(aggregated[hack_id].map(function(agg){
            return parseInt(agg.rating);
        }));
        summed.push({
            mean: innerSum / aggregated[hack_id].length,
            hack_id: hack_id
        });
    });
    var sorted = summed.sort(function(l , r){
        return r.mean - l.mean;
    });
}

var groupBy = function(objs, key){
    return objs.reduce(function (rv, next){
        (rv[key(next)] = rv[key(next)] || []).push(next);
    }, {});
}

var sum = function(arr){
    return arr.reduce(function(acc, next){
        return acc + next;
    }, 0);
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
            $('#hack-view').html(makeTableForObjs(hacks, ['Id', 'Name', 'Location', 'Description', 'Prizes']));
        });

    socket.on('prizes-list', function(data) {
        $('#prize-view').empty();
        prizes = JSON.parse(data);
        $('#prize-view').html(makeTableForObjs(prizes, ['Name', 'Is Best Overall']));
    });

    socket.on('ratings-list', function(data){
        var sorted = sortRatedHacks(JSON.parse(data));
        $('#hack-overall-ranks').html(makeTableForObjs(sorted, ['hack id', 'mean']));
    });

    socket.on('superlatives-list', function(data){
        var byPrize = groupBy(JSON.parse(data), function(hjp){
            return hjp.prize_id;
        });
        var prizewiseScores = {};
        Object.keys(byPrize).map(function(prizeId){
            prizewiseScores[prizeId] = byPrize[prizeId].map(function(rating){
                return [{
                    hack_id: rating.hack_1,
                    rating: 3
                }, {
                    hack_id: rating.hack_2,
                    rating: 2
                }];
            }).reduce(function(n, acc){
                return acc.concat(n);
            }, []);
        });

        var sortedPerPrize = {};
        Object.keys(prizewiseScores).map(function(prizeId){
            sortedPerPrize[prizeId] = sortRatedHacks(prizewiseScores[prizeId]);
        });
        $('#hack-superlative-ranks').clear();
        Object.keys(sortedPerPrize).map(function(prizeId){
            $('#hack-superlative-ranks').append('<table id="hack-superlative-' + prizeId + '"></table>");
            $('#hack-superlative-' + prizeId).html(makeTableForObjs(sortedPerPrize, ['hack_id', 'mean']));
        });
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
