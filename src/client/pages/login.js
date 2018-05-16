(function (loginPage) {
"use strict";

var loginInputs;
var emailInput;
var passInput;
var loginButton;
var logoutButton;
var judgeButton;
var testButton;
var messageText;

var token = "";

function init() {
    loginInputs  = document.getElementById("loginInputs");
    emailInput   = document.getElementById("emailInput");
    passInput    = document.getElementById("passInput");
    loginButton  = document.getElementById("loginButton");
    logoutButton = document.getElementById("logoutButton");
    judgeButton  = document.getElementById("judgeButton");
    testButton  = document.getElementById("testButton");
    messageText  = document.getElementById("messageText");

    loginButton.disabled = false;
    logoutButton.disabled = false;
    judgeButton.disabled = false;
    testButton.disabled = false;

    emailInput.addEventListener("keypress", onTextKeyPress);
    passInput.addEventListener("keypress", onTextKeyPress);

    loginButton.addEventListener("click", onLogin);
    logoutButton.addEventListener("click", onLogout);
    judgeButton.addEventListener("click", onJudge);
    testButton.addEventListener("click", onTest);

    token = localStorage.getItem("token") || "";
    if (token) {
        setMessage("Connecting to Sledge... (Note: failure to connect may indicate bad credentials)");

        loginInputs.classList.add("hidden");
        loginButton.disabled = true;
        testButton.disabled = true;

        sledge.subscribe(function (xx) {
            if (sledge.isInitialized()) {
                let judgeId = parseInt(localStorage.getItem("judgeId"));
                let info = sledge.getJudgeInfo({judgeId});

                if (info) {
                    setMessage("You are logged in as "+info.name+" <"+info.email+"> (ID: "+info.id+").");
                } else {
                    setMessage("You are logged in, but we do not recognize Judge ID "+localStorage.getItem("judgeId")+"!");
                }
            }
        });
        sledge.init({token: localStorage.getItem("token")});
    } else {
        setMessage("You are not logged in.");
        logoutButton.disabled = true;
        judgeButton.disabled = true;
    }
}
loginPage.init = init;

function setMessage(txt) {
    messageText.innerHTML = "";
    let txtNode = document.createTextNode(txt);
    messageText.appendChild(txtNode);
}

function onTextKeyPress(evt) {
    if (evt.key === "Enter") {
        onLogin(null);
        evt.preventDefault();
    }
}

function onLogin(evt) {
    setMessage("Verifying login information...");

    loginInputs.classList.add("hidden");
    loginButton.disabled = true;

    if ( emailInput.value === "admin" || (/admin:[0-9]{1,}/).test(emailInput.value) ) {
        setMessage("Logging in as admin");
        localStorage.setItem("judgeId", emailInput.value === "admin" ? "0" : emailInput.value.split(":")[1]);
        localStorage.setItem("token", passInput.value);

        setTimeout(function () {
            window.location.href = window.location.href;
        }, 500);

        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        if (xhr.status != 200) {
            let printableMessage = xhr.responseText.replace(/\<[^>]{1,}\>/g,"\t");
            setMessage("Failed with Error: " + printableMessage);

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

function onTest(evt) {
    localStorage.setItem("judgeId", 1);
    localStorage.setItem("token", "test");
    window.location.href = window.location.href;
}

})(this.loginPage || (this.loginPage = {}));
