(function () {
"use strict";

const e = React.createElement;

class JudgingRoom extends React.Component {
    render() {
        return e("div", null,
                e("h1", null, "Judging Room"),
                e("p", null, "Hello, World!")
                );
    }
}

function init() {
    ReactDOM.render(
            React.createElement(JudgingRoom, null),
            document.getElementById("judgingroom"));
}

window.addEventListener("load", init);
})();
