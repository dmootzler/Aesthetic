$(function() {
    FastClick.attach(document.body);
    buildListeners();
});

// add listeners to buttons
function buildListeners() {
    $("#login-btn").click(authenticate);
}

// do login process
function authenticate() {
    // the InAppBrowser window used for authentication
    var auth = window.open("https://api.instagram.com/oauth/authorize/?client_id=" + KEYS.CLIENT_ID + "&redirect_uri=https://www.instagram.com&response_type=token", "_blank", "location=no");
    // add listener for load
    auth.addEventListener("loadstop", function(e) {
        // url string passed by event
        var url = e.url;
        // access token pulled from url
        var token = url.split("#access_token=")[1];
        // instagram access token
        KEYS.ACCESS_TOKEN = token;
        // close window
        auth.close();
        // request feed information from the API
        $.get("https://api.instagram.com/v1/users/self/media/recent/?access_token=" + KEYS.ACCESS_TOKEN + "&count=18", function(response) {
            parseFeed(response.data);
        });
        // request profile information from API
        $.get("https://api.instagram.com/v1/users/self/?access_token=" + KEYS.ACCESS_TOKEN, function(response) {
            parseProfile(response.data);
        });
    });
}

// load a user's feed into the UI
function parseFeed(data) {
    // number of rows parsed already
    var rowCount = 1;
    // create the first row
    $(".feed-wrapper").append("<div class='feed-row' id='feed-row-1'><div class='feed-item' id='feed-item-0'></div></div>");
    // add each image to a row
    for(var i = 1; i < data.length + 1; i++) {
        // add the image
        $("#feed-row-" + rowCount).append("<div class='feed-item' id='feed-item-" + i + "'></div>");
        $("#feed-item-" + i).css("background-image", "url(" + data[i - 1].images.standard_resolution.url + ")");
        // check if the row is full
        if((i + 1) % 3 == 0 && i < data.length) {
            rowCount++;
            $(".feed-wrapper").append("<div class='feed-row' id='feed-row-" + rowCount + "'></div>");
        }
    }
    // reveal the feed UI
    loadFeed();
}

// load a user's profile information into the UI
function parseProfile(data) {
    $(".profile-header").html(data.username);
    $(".profile-pic").css("background-image", "url(" + data.profile_picture + ")");
    $("#profile-stat-posts").html(data.counts.media);
    $("#profile-stat-followers").html(data.counts.followed_by);
    $("#profile-stat-following").html(data.counts.follows);
    $("#profile-name").html(data.full_name);
    $("#profile-bio").html(data.bio);
    
}

function loadFeed() {
    $("#login").css("display", "none");
    $("#feed").css("display", "flex");
}

