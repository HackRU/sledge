(function () {
"use info";

var e = React.createElement;

class JudgeInfo extends React.Component {
    render() {
        return e("div", { className: "judgeinfo-comp" },
            e("span", null,
                e("span", null, "Hello, "),
                e("span", { className: "judgeinfo-name" }, this.props.name),
                e("span", null, "!") )
        );
    }
}

window.judge.JudgeInfo = JudgeInfo;

})();
