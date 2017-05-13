$(function() {
    buildListeners();
});

// add listeners to buttons
function buildListeners() {
    $("#login-btn").click(authenticate);
}

// do login process
function authenticate() {
    // the InAppBrowser window used for authentication
    https://api.instagram.com/oauth/authorize/?client_id=CLIENT-ID&redirect_uri=REDIRECT-URI&response_type=token
    var auth = window.open("https://api.instagram.com/oauth/authorize/?client_id=" + KEYS.CLIENT_ID + "&redirect_uri=REDIRECT-URI&response_type=token", "_blank");
}

