//sendchat
//conversation
//playerinput

var currentPlayer
var player1 = "";
var player2 = "";


  // Initialize Firebase
var config = {
    apiKey: "AIzaSyCEwu0o61zxY7iZM21gEli8apJQTtR-kZg",
    authDomain: "rock-paper-scissor-18dbc.firebaseapp.com",
    databaseURL: "https://rock-paper-scissor-18dbc.firebaseio.com",
    projectId: "rock-paper-scissor-18dbc",
    storageBucket: "",
    messagingSenderId: "467350525724"
};

firebase.initializeApp(config);

var database = firebase.database();

function addUser () {
	database.ref("/users").once('value').then(function(snapshot) {
		var userData = snapshot.val();
		var numPlayers = snapshot.numChildren()
		currentPlayer = $("#playerinput").val();
		
		if (userData === null) {
			database.ref("/users/" + currentPlayer).set({
				name: $("#playerinput").val(),
				playerNum: "1"
			})
			$(".p1").attr("playerName" , currentPlayer);
			$("#chatMessage").prop("disabled", false);
		}
		else if (snapshot.numChildren() === 2 ) {
			$("#playerinput").val("Two Players are already playing");

		} else if (snapshot.numChildren() ===1 ) {
			snapshot.forEach(function(childSnap){
				var playerNumber = childSnap.val().playerNum;
				if( parseInt(playerNumber) === 1 ) {
					console.log("Player Num is 1, adding 2")
					database.ref("/users/" + currentPlayer ).set({
						name: currentPlayer,
						playerNum: "2"
					})
					$(".p2").attr("playerName" , currentPlayer);
				} else {
					console.log("Player Num is 2, adding 1")
					database.ref("/users/" + currentPlayer).set({
						name: currentPlayer,
						playerNum: "1"
					})	
					$(".p1").attr("playerName" , currentPlayer);	
				}
			})
			$("#chatMessage").prop("disabled", false);
		} else {
			console.log("Num children are " + snapshot.numChildren());
		}
	});
	$("#playerinput").prop("disabled", true);
}


function closeConnection () {
	database.ref("/users/" + currentPlayer).remove()
	database.ref("/choices/"+ currentPlayer).remove()
}

function sendMessage () {
	event.preventDefault();


   // Grabbed values from text boxes
   var messageVal = {
    name: currentPlayer,
	message: $("#chatMessage").val(),
	date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
	}

     database.ref("/messages").push(messageVal);
}

function whoWins() {
	if ($(this).attr("playerName") === currentPlayer) {
	console.log(currentPlayer);
	console.log($(this).attr("data-value"));
	database.ref("/choices/"+currentPlayer).set({
		choice: $(this).attr("data-value")
	})

	$(this).removeClass("btn-primary");
	$(this).addClass("btn-danger");
	}
}

$(document).on("click", "#playbutton", addUser)
$(window).on("unload", closeConnection)
$(document).on("click", "#sendchat",sendMessage)
$(document).on("click", ".choice", whoWins)


database.ref("/messages").orderByChild("date").on("child_added", function(snapshot) {
    // $("#userdatatable")
    var messageData = snapshot.val();
    var message = messageData.message;
    var sender = messageData.name;
    var messageDate = messageData.date;

    if (sender === currentPlayer) {
    	var messageLoc = "left";
    	var timeLoc="right";
    	var imageSource = "http://placehold.it/40/55C1E7/fff&text=Me"
    } else {
    	var messageLoc = "right";
    	var timeLoc="left";
    	var imageSource = "http://placehold.it/40/55C1E7/fff&text=Enemy"
    }


    var newMessage = $("<li>");

    //add image stuff
    var myAvatar = $("<span>");
    myAvatar.addClass("chat-img pull-"+messageLoc);

    var myAvatarImg = $("<img>");
    myAvatarImg.attr("src", imageSource);
    myAvatarImg.addClass("img-circle");
    myAvatar.append(myAvatarImg);

    //create message elements
    var messageBox=$("<div>");
    var messageHeader=$("<div>");
    var playerName = $("<strong>");
    var messageTime = $("<small>");
    var messageBody=$("<p>");

    //Update chat message
    messageBody.addClass("pull-"+messageLoc);
    messageBody.text(message);

    //Update message time
    messageTime.addClass("text-muted pull-"+timeLoc)
    messageTime.append('<span class="glyphicon glyphicon-time"></span>')
    messageTime.text(messageDate);

    //Update userInfo
    playerName.addClass("primary-font pull-"+messageLoc);
    playerName.text(sender);


    //add time and player name to message header
    messageHeader.addClass("header");
    messageHeader.append(playerName);
    messageHeader.append(messageTime);
    

    //add stuff for message box
    messageBox.addClass("chat-body clearfix");
    messageBox.append(messageHeader);
    messageBox.append("<br>");
    messageBox.append(messageBody);

    newMessage.append(myAvatar);
    newMessage.append(messageBox);


    $("#conversation").append(newMessage);
    $("#mypanel").scrollTop(document.getElementById("mypanel").scrollHeight);

})


database.ref("/users").on("child_added", function(snapshot) {
    console.log(snapshot.val())
    // $("#userdatatable")
    var currentPlayers = snapshot.val().name;
    var playerNum = snapshot.val().playerNum;
    $("#p"+playerNum+"h").text("Player " + playerNum + ": " + currentPlayers);
    $("#p"+playerNum+"h").attr("data-value", currentPlayers)
})
