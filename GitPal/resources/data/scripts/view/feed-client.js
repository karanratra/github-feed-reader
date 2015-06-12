var baseURL = "https://api.github.com/";
var userNotifications = {};
var UNAUTHORIZEDACCESS_STATUS = 401;
var SUCCESS_STATUS = 200;
var timer = undefined; 
var backgroundTimer ;

String.prototype.endsWith = function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};

var FEEDCLIENT = {
    getUserRecievedEvents:function(){
        console.log("@feed-client -- Inside getUserRecievedEvents");
        var URL = baseURL +"users/" + localStorage["user_id"] +"/received_events?access_token=" + localStorage["user_api_token"] ;
        try{
            $.get(URL,function(userRecievedEvents){
                if(localStorage["user_recieved_events"]){
                   console.log("@feed-client -- Saving the old user recieved events.");
                   localStorage["temp_user_recieved_events"] = localStorage["user_recieved_events"] ;
                   localStorage["user_recieved_events"] = "";
                }
                console.log("@feed-client -- Reloading the user recieved events.");
                localStorage["user_recieved_events"] = JSON.stringify(userRecievedEvents);
                FEEDVIEW.createUserRecievedEventsView();
            });
        }catch(e){
            console.log("@feed-client -- exception while retrieving the user recieved events" + e);
            return false;
        }
        FEEDVIEW.addToggleFunctionality();
        return true;
    },
    getUserEvents: function() {
        console.log("@feed-client -- Inside getUserEvents");
        var URL = baseURL +"users/" + localStorage["user_id"] +"/received_events?access_token=" + localStorage["user_api_token"] ;
        try{
            $.get(URL,function(userRecievedEvents){
                console.log("@feed-client -- Storing the user recieved events in local storage");
                localStorage["user_recieved_events"] = JSON.stringify(userRecievedEvents);
                FEEDVIEW.createUserRecievedEventsView();
            });
        }catch(e){
            console.log("@feed-client -- exception while retrieving the user recieved events" + e);
            return false;
        }
        return true;
    },
    getUserNotifications: function(){
       console.log("@feed-client.js - Inside getUserNotifications");
       var URL = baseURL + "notifications?access_token=" +  localStorage["user_api_token"] ;
       try{
        $.get(URL,function(data){
            for(i = 0 ; i<data.length ; i++){
                var obj = data[i];
                var repositoryID = obj["repository"]["id"];
                if(userNotifications[repositoryID] != undefined){
                    var responseJson = {};
                    FEEDCLIENT.getResponseJsonElement(obj,responseJson);
                    userNotifications[repositoryID][userNotifications[repositoryID].length] = responseJson;
                   
                }else{
                    var userNotificationResponseArray = [];
                    var responseJson = {};
                    FEEDCLIENT.getResponseJsonElement(obj,responseJson);
                    userNotificationResponseArray[0] = responseJson;
                    userNotifications[repositoryID] = userNotificationResponseArray;
                }
            }
            
            if(localStorage["user_notifications"]){
                console.log("@feed-client -- Storing the old user notifications in local storage");
                localStorage["temp_user_notifications"] = localStorage["user_notifications"];
                localStorage["user_notifications"] = "";
            }
            console.log("@feed-client -- Reloading the user notifications.");
            localStorage["user_notifications"] = JSON.stringify(userNotifications);

            FEEDVIEW.createUserNotificationsView();
            FEEDCLIENT.getUserRecievedEvents();
        });
        }catch(e){
            console.log("@feed-client -- exception while retrieving the user repos" + e);
            return false;
        }
        return true;
    },
    getUserRepositories:function(){
        console.log("@feed-client.js - Inside getUserRepositories");
        var URL = baseURL + "users/" + localStorage["user_id"] + "/repos?access_token=" +  localStorage["user_api_token"] ;
          try{
            $.get(URL,function(data,status,xhr){
                console.log("@feed-client -- status "  + status);
                if( xhr["status"] === SUCCESS_STATUS){
                  var userRepositoriesArray = [];
                  for(i = 0 ; i< data.length ; i++){
                    var obj = data[i];
                    var repoJson = {};
                    repoJson["id"] = obj["id"];
                    repoJson["full_name"] = obj["full_name"];
                    repoJson["html_url"] = obj["html_url"];
                    repoJson["name"] = obj["name"];
                    userRepositoriesArray[i] = repoJson;
                  }
                  console.log("@feed-client -- Storing the old user repositories in local storage");
                  if(localStorage["user_repositories"]){
                    console.log("@feed-client -- Reloading the user repositories.");
                    localStorage["temp_user_repositories"] = localStorage["user_repositories"];
                    localStorage["user_repositories"] = "";
                  }
                  console.log("@feed-client -- Reloading the user repositories.");
                  localStorage["user_repositories"] = JSON.stringify(userRepositoriesArray); 
                  FEEDVIEW.createUserRepositoriesView();
                  FEEDCLIENT.getNewUserReopNotifications();
                  FEEDCLIENT.getUserNotifications();
                  
                }
            });
        }catch(e){
            console.log("@feed-client -- exception while retrieving the user repos" + e);
            alert(e);
            return false;
        }
        return true;
    },
    getNewUserReopNotifications:function(){
            var parsedNewJson = JSON.parse(localStorage["user_repositories"]);
            var parsedOldJson = JSON.parse(localStorage["temp_user_repositories"]);
            if(!Object.identical(parsedNewJson,parsedOldJson)){
                for(i = 0; i < parsedNewJson.length ;i++){
                    var newObj = parsedNewJson[i];
                     for(j=0;j<parsedOldJson.length;j++){
                        var oldObj = parsedOldJson[j];
                        if(oldObj["id"] == newObj["id"]){
                            console.log("@getNewUserReopNotifications - New Repo Added");
                            var title = "New Repository Added";
                            var message = newObj["name"] + 'added to the list of repositories';
                            FEEDVIEW.showNotifications(title,message,newObj["html_url"]);
                        }

                     }
                }
            }
    },
    getRepoOwnerInformation:function(){
         console.log("@feed-view -- Creating view for user repos");
         var finalResponseJson = localStorage.getItem("user_repositories");
         var finalParsedJSon = JSON.parse(finalResponseJson);
         var userRepositoriesArray = [];
         for(i = 0 ; i < finalParsedJSon.length ; i++){
            var val = finalParsedJSon[i];
            var list ;
            var uList ;
            var repoJson = {};
            repoJson["id"] = val["id"];
            repoJson["full_name"] = val["full_name"];
            repoJson["html_url"] = val["html_url"];
            repoJson["name"] = val["name"];

            var URL = baseURL + "repos/" + localStorage["user_id"] +"/" + val["name"] +"?access_token=" + localStorage["user_api_token"];
              $.get(URL,function(data,status,xhr){
                console.log("@feed-client getRepoOwnerInformation -- status "  + status);
                if( xhr["status"] === SUCCESS_STATUS){
                   var parsedData = JSON.parse(data);
                   repoJson["parent_full_name"] = parsedData["parent"]["full_name"];
                   repoJson["parent_html_url"] =  parsedData["parent"]["html_url"];
                }
            });
              userRepositoriesArray[i] = repoJson;
          }
          console.log("@feed-client -- Storing the user repositories in local storage after updating the parent repo info");
          localStorage["user_repositories"] = JSON.stringify(userRepositoriesArrayz);
    },
    validateUserInfo:function(userID,token,callBackFunction){
        var URL = baseURL + "user"
          $.ajax({
            url: URL,
            async: true,
            dataType: 'html',
            beforeSend: function() {
                $(".loader").show();
            },
            type: "GET",
            data: 'access_token=' + token,
            cache: false,
            success: function(data, textStatus, xhr) {
                var parsedData = JSON.parse(data);
                console.log("@feed-client -- User authenticated " + parsedData["login"]);
                if(userID === parsedData["login"]){
                    localStorage["user_info"] = JSON.stringify(data);
                    localStorage["user_api_token"] = token;
                    localStorage["user_id"] = userID;
                    return callBackFunction( xhr["status"], textStatus );  
                }else{
                    var showMessage = '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>  <span class="sr-only">' + textStatus + ':</span>' + UNAUTHORIZEDACCESS_STATUS + '(Unauthorized)'+ '</div>';
                    return callBackFunction ( UNAUTHORIZEDACCESS_STATUS, showMessage );  
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                var showMessage = '<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>  <span class="sr-only">' + textStatus + ':</span>' + xhr["status"] +'(' + errorThrown.toString() +')'+ '</div>';
                return callBackFunction ( xhr["status"], showMessage ); 
            }
        });


    },
    getResponseJsonElement:function(object,responseJson){
        responseJson["subject_title"] = object["subject"]["title"];
        responseJson["latest_comment_url"] = object["subject"]["latest_comment_url"];
        responseJson["type"] = object["subject"]["type"];
        responseJson["repo_html_url"] = object["repository"]["html_url"];
        responseJson["repo_name"] = object["repository"]["full_name"];
        responseJson["id"] = object["id"];
    }
};