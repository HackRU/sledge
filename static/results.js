(function (resultsPage) {
"use strict";

var winnersTable;
var superlativesTable;

function init() {
    winnersTable = document.getElementById("winnersTable");
    superlativesTable = document.getElementById("superlativesTable");

    sledge.init({
        token: localStorage.getItem("token")
    });
    sledge.subscribe(onSledgeEvent);
}
resultsPage.init = init;

function onSledgeEvent(evt) {
    if (sledge.isInitialized()) {
        renderWinnersTable();
        renderSuperlativesTable();
    }
}
resultsPage.onSledgeEvent = onSledgeEvent;

function renderWinnersTable() {
    let ratings = sledge.getAllRatings();
    let hacks = sledge.getAllHacks();
    let judges = sledge.getAllJudges();
    let averages = calcAverages(ratings);

    //sort hacks
    let len = averages.length;
    for (let i = 1; i < len; i++) {
	let tmp = averages[i]; //Copy of the current element.
	let tmpRating = ratings[i];
	let tmpHack = hacks[i];
	//Check through the sorted part and compare with the number in tmp.
	//maybe i should work out a way to not use var here, but whatever
	for (var j = i - 1; j > 0 && (averages[j] <= tmp); j--) {
	    //Shift the number
	    averages[j + 1] = averages[j];
	    ratings[j + 1] = ratings[j];
	    hacks[j + 1] = hacks[j];
	    
	}
	//Insert the copied number at the correct position
	//in sorted part.
	averages[j + 1] = tmp;
	ratings[j + 1] = tmpRating;
	hacks[j + 1] = tmpHack;
    }

    let ce = document.createElement.bind(document);
    let ct = document.createTextNode.bind(document);

    let thead = ce("thead");
    let thead_tr = ce("tr");
    let thead_tr_hacks = ce("th");
    thead_tr_hacks.appendChild(ct("Hack Name"));
    thead_tr.appendChild(thead_tr_hacks);
    for (let i=1;i<judges.length;i++) {
        let td = ce("th");
        td.appendChild(ct( judges[i].name ));
        thead_tr.appendChild(td);
    }
    let thead_tr_avg = ce("th");
    thead_tr_avg.appendChild(ct("Average"));
    thead_tr.appendChild(thead_tr_avg);
    thead.appendChild(thead_tr);

    let tbody = ce("tbody");
    for (let i=1;i<hacks.length;i++) {
        let tr = ce("tr");
        let tr_name = ce("td");
        tr_name.appendChild(ct(hacks[i].name));
        tr.appendChild(tr_name);

        for (let j=1;j<judges.length;j++) {
            let td = ce("td");
            td.appendChild(ct( ratingString(ratings[i][j]) ));
            tr.appendChild(td);
        }

        let tr_avg = ce("td");
        tr_avg.appendChild(ct(averages[i]>0?averages[i].toString(10):"N/A"));
        tr.appendChild(tr_avg);

        tbody.appendChild(tr);
    }

    winnersTable.innerHTML = "";
    winnersTable.appendChild(thead);
    winnersTable.appendChild(tbody);
}
resultsPage.renderWinnersTable = renderWinnersTable;

function ratingString(rating) {
    if ( rating < 0 ) {
        return "No Show";
    } else if ( rating == 0 ) {
        return "-";
    } else {
        return rating.toString(10);
    }
}
resultsPage.ratingString = ratingString;

function calcAverages(ratings) {
    return ratings.map(function (rs) {
        let raters = 0;
        let total = 0;
        for (let i=0;i<rs.length;i++) {
            if ( rs[i] > 0 ) {
                total += rs[i];
                raters++;
            }
        }

        if ( raters <= 0 ) {
            return -1;
        } else {
            return total / raters;
        }
    });
}
resultsPage.calcAverages = calcAverages;

function renderSuperlativesTable() {
    let scores = calcSuperScores();

    let ce = document.createElement.bind(document);
    let ct = document.createTextNode.bind(document);

    function th(name) {
        let th = ce("th");
        th.appendChild(ct(name));
        return th;
    }
    function td(name) {
        let td = ce("td");
        td.appendChild(ct(name));
        return td;
    }

    let hacks = sledge.getAllHacks();
    let ss = sledge.getSuperlatives();

    let thead = ce("thead");
    let thead_tr = ce("tr");
    thead_tr.appendChild(th("Hack Name"));
    for (let i=0;i<ss.length;i++) {
        thead_tr.appendChild(th(ss[i].name));
    }
    thead.appendChild(thead_tr);

    let tbody = ce("tbody");
    for (let i=1;i<hacks.length;i++) {
        let tr = ce("tr");
        tr.appendChild(td(hacks[i].name));
        for (let j=0;j<ss.length;j++) {
            tr.appendChild(td(scores[i][j]));
        }
        tbody.appendChild(tr);
    }

    superlativesTable.innerHTML = "";
    superlativesTable.appendChild(thead);
    superlativesTable.appendChild(tbody);
}
resultsPage.renderSuperlativesTable = renderSuperlativesTable;

function calcSuperScores() {
    let placements = sledge.getAllSuperlativePlacements();
    return placements.map(function (s) {
        return s.map(function (o) {
            return "First:"+o.first.length+" / Second:"+o.second.length+" = "
                + (o.first.length*2+o.second.length);
        });
    });
}
resultsPage.calcSuperScores = calcSuperScores;

})(window.resultsPage || (window.resultsPage = {}));
