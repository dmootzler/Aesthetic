// key-value storage
var storage = window.localStorage;
// preview button image
var preview;

$(function() {
    FastClick.attach(document.body);
    buildListeners();
    if(storage.getItem("access_token")) {
        callAPI(storage.getItem("access_token"));
    }
    preview = $("#feed-item-0").css("background-image");
});

// add listeners to buttons
function buildListeners() {
    // add click listener to connect to IG button
    $("#login-btn").click(authenticate);
    // add click listener to preview button
    $("#feed-item-0").click(previewPic);
    // add click listener to help button for preview
    $("#help-preview").click(function() {
        closeHelp();
        previewPic();
    });
    // add click listener to close help button
    $("#help-close").click(function() {
        closeHelp();
    });
    // add click listener to logout button
    $("#help-logout").click(function() {
        closeHelp();
        logout();
    });
    
    // add swipe listeners to feed
    var feed = document.getElementById("feed");
    Hammer(feed).on("swiperight", help);
}

// display an error message when unclickable items are clicked
function unclickable() {
    navigator.notification.alert("myAesthetic is only for previewing pictures before you post. Use the official Instagram app to access this feature and many others!", null, "Sorry!", "Back to myAesthetic");
}

// logout the current user and return to the login screen
function logout() {
    // remove the access token from storage
    storage.removeItem("access_token");
    // remove the access token from memory
    KEYS.ACCESS_TOKEN = null;
    $("#feed-item-0").css("background-image", preview);
    $("#login").css("display", "flex");
    $("#feed").css("display", "none");
    $(".feed-wrapper .remove").remove();
}

// position the elements of the help window
function initHelp() {
    // position the preview guidelines
    $("#help-preview").offset($("#feed-item-0").offset());
    // add swipe listener to help window
    var help = document.getElementById("help");
    Hammer(help).on("swipeleft", closeHelp);
}

// display the help info
function help() {
    // show the help screen
    $("#help").css("display", "flex");
    // initialize the help screen
    initHelp();
}

// close the help info
function closeHelp() {
    $("#help").css("display", "none");
}

// preview a picture within the feed
function previewPic() {
    // load picture into preview screen on success
    function onSuccess(imageURI) {
        $("#feed-item-0").css("background-image", "url(" + imageURI + ")");        
    }
    
    // alert on failure with cause
    function onFail(message) {
        
    }
    // request to take a picture
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    }); 
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
        // store the access token in memory
        storage.setItem("access_token", token);
        // retrieve posts and user info from API
        callAPI(token);
    });
}

// retrieve posts and user info from API
function callAPI(token) {
    // request feed information from the API
    $.get("https://api.instagram.com/v1/users/self/media/recent/?access_token=" + KEYS.ACCESS_TOKEN + "&count=18", function(response) {
        parseFeed(response.data);
    });
    // request profile information from API
    $.get("https://api.instagram.com/v1/users/self/?access_token=" + KEYS.ACCESS_TOKEN, function(response) {
        parseProfile(response.data);
    });
}

// load a user's feed into the UI
function parseFeed(data) {
    // number of rows parsed already
    var rowCount = 1;
    // add each image to a row
    for(var i = 1; i < data.length + 1; i++) {
        // add the image
        $("#feed-row-" + rowCount).append("<div class='feed-item remove unclickable' id='feed-item-" + i + "'></div>");
        $("#feed-item-" + i).css("background-image", "url(" + data[i - 1].images.standard_resolution.url + ")");
        // check if the row is full
        if((i + 1) % 3 == 0 && i < data.length) {
            rowCount++;
            $(".feed-wrapper").append("<div class='feed-row remove' id='feed-row-" + rowCount + "'></div>");
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
    
    $("#help-username").html(data.username);
    $("#help-name").html(data.full_name);
}

function loadFeed() {
    // hide the login page
    $("#login").css("display", "none");
    // reveal the feed preview
    $("#feed").css("display", "flex");
    
    // add click listeners to all unclickable items
    $(".unclickable").click(unclickable);
    
    // create help popup
    navigator.notification.alert("Swipe right at any time to access the help menu.", null, "Help Menu", "Back to myAesthetic");
}

