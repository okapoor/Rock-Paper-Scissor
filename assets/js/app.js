//sendchat
//conversation
//playerinput

var currentPlayer = "this is not a real player";
var whichPlayer;
var p0Win=0;
var p1Win=0;
var p0Lose=0;
var p1Lose=0;
var p0Ties=0;
var p1Ties = 0;
var players = [];
var choices = [];

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

function resetGame () {
	console.log("Rest game function was called")
			$(".p1").css("visibility", "visible");
			$("#p1Img").attr("src", "assets/images/what.png")
			$(".p2").css("visibility", "visible");
			$("#p2Img").attr("src", "assets/images/what.png")
}


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
			whichPlayer = "1";

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
					whichPlayer = "2";
				} else {
					console.log("Player Num is 2, adding 1")
					database.ref("/users/" + currentPlayer).set({
						name: currentPlayer,
						playerNum: "1"
					})	
					$(".p1").attr("playerName" , currentPlayer);
					whichPlayer = "1";	
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
	database.ref("/scoreboard/"+ currentPlayer).remove()

	database.ref("/users").once("value").then(function(snapshot){

		if (snapshot.numChildren() === 0 || snapshot.val() === null) {
			database.ref("/choices/").remove()
			database.ref("/scoreboard/").remove()
		}
	})


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
     $("#chatMessage").val("");
}

function whoWins() {
	if ($(this).attr("playerName") === currentPlayer) {
		database.ref("/choices/"+currentPlayer).set({
			name: currentPlayer,
			playerNum: whichPlayer,
			choice: $(this).attr("data-value")
		})
		$(".choice").css("visibility", "hidden");
		$("#p"+whichPlayer+"Img").attr("src", "assets/images/"+$(this).attr("data-value")+".png")
	}
}


function updateResults () {
	if (players.length===2) {
		var p0 = choices[0];
		var p1 = choices[1];
		console.log("Logging scoring results ---")
		console.log("P0 chose : " + p0)
		console.log("p1 chose : " + p1)

		console.log("Current score values for p0 and p1 are : " + p0Win + " " + p0Lose + " " +p0Ties + "---"+ p1Win + " " + p1Lose + " " +p1Ties  )

	    if(p0 == "Rock" && p1 == "Rock") {
	      p0Ties++;
	      p1Ties++;
	    }
	    else if (p0 == "Rock" && p1 == "Paper") {
	      p1Win++;
	      p0Lose++;
	    }
	    else if (p0 == "Rock" && p1 == "Scissor") {
	      p0Win++;
	      p1Lose++;
	    }
	    //second chunk
	    else if (p0 == "Paper" && p1 == "Paper") {
	      p0Ties++;
	      p1Ties++;
	    }
	    else if (p0 == "Paper" && p1 == "Scissor") {
	      p1Win++;
	      p0Lose++;
	    }
	    else if (p0 == "Paper" && p1 == "Rock") {
	      p0Win++;
	      p1Lose++;
	    }
	    //third chunk
	    else if (p0 == "Scissor" && p1 == "Scissor") {
	      p0Ties++;
	      p1Ties++;
	    }
	    else if (p0 == "Scissor" && p1 == "Paper") {
	      p0Win++;
	      p1Lose++;
	    }
	    else if (p0 == "Scissor" && p1 == "Rock") {
	      p1Win++;
	      p0Lose++;
	    }

		database.ref("/scoreboard/"+players[0]).set({
			name: players[0],
			wins:p0Win,
			losses:p0Lose,
			ties:p0Ties
		})

		database.ref("/scoreboard/"+players[1]).set({
			name: players[1],
			wins:p1Win,
			losses:p1Lose,
			ties:p1Ties
		})
		//Remove the choices var to empty it out
		database.ref("/choices").remove();


    	var scoreboardFooter = $(".panel-footer")
		$("#winsp1").text("Wins: " + p0Win)
		$("#winsp2").text("Wins: " + p1Win)
		$("#lossesp1").text("Losses: " + p0Lose)
		$("#lossesp2").text("Losses: " + p1Lose)
		$("#tiesp1").text("Ties: " + p0Ties)
		$("#tiesp2").text("Ties: " + p1Ties)
		setTimeout(resetGame, 2000)
	}
}






$(window).bind('beforeunload',closeConnection);
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
    var currentPlayers = snapshot.val().name;
    var playerNum = snapshot.val().playerNum;
    var playerElem = $("#p"+playerNum+"h");
    playerElem.css("webkit-animation-duration", "3s");
    playerElem.addClass("animated fadeOut")
    playerElem.text("")
    playerElem.removeClass("fadeOut")
    playerElem.addClass("fadeIn")
    $("#p"+playerNum+"h").html("<h4>" + currentPlayers+ "</h4>");
    $("#p"+playerNum+"h").attr("data-value", currentPlayers)
})

database.ref("/users").on("child_removed", function(snapshot) {
	if (snapshot.val() !== null) {
    var currentPlayers = snapshot.val().name;
    var playerNum = snapshot.val().playerNum;
    $("#p"+playerNum+"h").text(currentPlayers + "has left the game. Please wait for another player to join");
    $("#p"+playerNum+"h").removeAttr("data-value")
    // $("#userdatatable")
	}
})

database.ref("/choices").on("value", function(snapshot) {

	if (snapshot.numChildren() === 2) {
			players = [];
			choices = [];
		snapshot.forEach(function(childSnap){
			console.log("Hiding buttons")

			var playerName = childSnap.val().name;
			var whichPlayer = childSnap.val().playerNum;
			var playerChoice = childSnap.val().choice;
			players.push(playerName);
			choices.push(playerChoice);
			$(".p"+whichPlayer).css("visibility", "hidden");
			$("#p"+whichPlayer+"Img").attr("src", "assets/images/"+playerChoice+".png")
		})
		database.ref("/scoreboard").once('value').then(function(snapshot) {
			console.log("====getting value of scoreboard======")
			if (snapshot.val() === null) {
				console.log("null score loop was entered")
				p0Win=0;
				p1Win=0;
				p0Lose=0;
				p1Lose=0;
				p0Ties=0
				p1Ties=0
			}else {
				console.log("This loop is getting the score from the DB")
				database.ref("/scoreboard/" + players[0]).once('value').then(function(snapshot) {
					p0Win = snapshot.val().wins;
					p0Lose = snapshot.val().losses;
					p0Ties = snapshot.val().ties;
					console.log("Current score values for p0 : " + p0Win + " " + p0Lose + " " +p0Ties )

				})
				database.ref("/scoreboard/" + players[1]).once('value').then(function(snapshot) {
					p1Win = snapshot.val().wins;
					p1Lose = snapshot.val().losses;
					p1Ties = snapshot.val().ties;
					console.log("Current score values for p1 : " + p1Win + " " + p1Lose + " " +p1Ties )
				})
			}
		})
		console.log(players);
		console.log(choices);
		updateResults();
	}
})


// database.ref("/scoreboard").on("value", function(snapshot){
// 		console.log("------")
// 	console.log(snapshot.val())
// 	console.log(snapshot.numChildren())
// 	console.log("------")
// 	var players = [];
// 	var choices = [];
// 	if (snapshot.numChildren() === 2) {
// 		snapshot.forEach(function(childSnap){
// 			var playerName = childSnap.val().name;
// 			var whichPlayer = childSnap.val().playerNum;
// 			var playerChoice = childSnap.val().choice;
// 			players.push(playerName);
// 			choices.push(playerChoice);
// 			$(".p"+whichPlayer).css("visibility", "hidden");
// 			$("#p"+whichPlayer+"Img").attr("src", "assets/images/"+playerChoice+".png")
// 			$(".p"+whichPlayer).removeClass("btn-danger");
// 			$(".p"+whichPlayer).addClass("btn-primary");
// 			$(this).removeClass("btn-primary");
// 			$(this).addClass("btn-danger");
// 		})

// 		updateResults(players, choices);
// 	}


// })



