(function () {
"use strict";

var loginInputs;
var emailInput;
var passInput;
var loginButton;
var logoutButton;
var judgeButton;
var messageText;

var token = "";

function init() {
    loginInputs  = document.getElementById("loginInputs");
    emailInput   = document.getElementById("emailInput");
    passInput    = document.getElementById("passInput");
    loginButton  = document.getElementById("loginButton");
    logoutButton = document.getElementById("logoutButton");
    judgeButton  = document.getElementById("judgeButton");
    messageText  = document.getElementById("messageText");

    loginButton.disabled = false;
    logoutButton.disabled = false;
    judgeButton.disabled = false;

    loginButton.addEventListener("click", onLogin);
    logoutButton.addEventListener("click", onLogout);
    judgeButton.addEventListener("click", onJudge);

    token = localStorage.getItem("token") || "";
    if (token) {
        setMessage("Connecting to Sledge...");

        loginInputs.classList.add("hidden");
        loginButton.disabled = true;

        sledge.subscribe(function (xx) {
            if (sledge.isInitialized()) {
                let judgeId = parseInt(localStorage.getItem("judgeId"));
                let info = sledge.getJudgeInfo({judgeId});

                setMessage("You are logged in as "+info.name+" <"+info.email+"> (ID: "+info.id+").");
            }
        });
        sledge.init({token: localStorage.getItem("token")});
    } else {
        setMessage("You are not logged in.");
        logoutButton.disabled = true;
        judgeButton.disabled = true;
    }
}
window.addEventListener("load", init);

function setMessage(txt) {
    messageText.innerHTML = "";
    let txtNode = document.createTextNode(txt);
    messageText.appendChild(txtNode);
}

function onLogin(evt) {
    setMessage("Verifying login information...");

    loginInputs.classList.add("hidden");
    loginButton.disabled = true;

    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        if (xhr.status != 200) {
            setMessage("Failed with Error: "+xhr.responseText);

            loginInputs.classList.remove("hidden");
            loginButton.disabled = false;
        } else {
            let res = JSON.parse(xhr.responseText);
            if (!res.success) {
                setMessage("Failed with Error: "+res.message);
                loginInputs.classList.remove("hidden");
                loginButton.disabled = false;
            } else {
                setMessage(res.message);
                localStorage.setItem("judgeId", res.judgeId);
                localStorage.setItem("token", res.token);

                window.location.href = window.location.href;
            }
        }
    });
    xhr.open("POST", "/login");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        email: emailInput.value,
        password: passInput.value
    }));
}

function onLogout(evt) {
    localStorage.removeItem("token");
    window.location.href = window.location.href;
}

function onJudge(evt) {
    window.location.href = "/judge.html";
}

window.login = {
    init
};

})();
