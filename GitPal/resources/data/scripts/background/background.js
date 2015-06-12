
console.log("Inside @background.js");


var backgroundTimer = setInterval(function() {
	 console.log("@Inside timer...");
     //call the api's only when we have the user details.
     if(localStorage["user_info"] != undefined && localStorage["user_info"].length > 0 ){
        FEEDCLIENT.getUserRepositories();
      } 
}, 30000);
