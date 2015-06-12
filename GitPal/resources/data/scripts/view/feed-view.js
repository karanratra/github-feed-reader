var gitHubURL = 'https://github.com/';
var corpExtension = '@corp.com';
var chatCorpExtension = '@corp.com';
var emailImgSrc="../images/email.png";
var chatIconImgSrc="../images/chat.png";
var UNDEFINED = "undefined";
var delimiter ="  ";
var firstLoading = false;
var notificationimgSrc = "../images/rss_feed_reader_1.png";

var actionMap = {
    "PullRequestEvent" : "pull request" ,
    "PushEvent" : "pushed to",
    "PullRequestReviewCommentEvent" : "commented on pull request ",
    "IssueCommentEvent" : "commented on pull request",
    "CreateEvent" : "created",
    "ReleaseEvent" : "released",
    "MemberEvent"  : "added",
    "DeleteEvent" : "deleted",
    "IssuesEvent" : "issue",
    "ForkEvent"   : "forked"
};

var FEEDVIEW = {
    createView: function(response) {
        console.log("@feed-View.js -- createView");
        var unOrderedList = '<ul id="recieved_events_ul">';
        for(i = 0 ; i<response.length ; i++){
            var obj = response[i];
            var actor = obj["actor"];
            var actorName = obj["actor"]["login"];
            var actorGitURL = gitHubURL + actorName;
            var actorAvatarUrl = obj["actor"]["avatar_url"];
            var type = obj["type"];
            var repoName = obj["repo"]["name"];
            var payload = obj["payload"];
            var pullRequest = payload["pull_request"];
            var action = FEEDVIEW.getAction(type,repoName,payload);
            var pushEventBranchName = FEEDVIEW.getPushEventBranchName(payload);
            // var email = '<a style="padding: 0 0 0 5px;" href="mailto:' + actorName + corpExtension + '?subject=' + title + '&body=' + response["html_url"] +'"  class="email">' +'<img src="' + emailImgSrc + '" /></a>';
            // var chat = '<a style="padding: 0 0 0 5px;" href="sip:' + response["user_id"] + chatCorpExtension + '" class="chat">' +'<img src="' + chatIconImgSrc + '" /></a>';
            var listItem = '<li class="box"><a class="hover_img" href=' + actorGitURL + delimiter + 'target="_blank">' 
                             + actorName + '<span><img src="' +actorAvatarUrl + '" alt="image" height="100"/></span></a>' + delimiter + '<i>' + action +'</i>' 
                             + delimiter + '</li>';
            unOrderedList = unOrderedList + listItem ;
            }
            unOrderedList = unOrderedList + '</ul>';
            if($("#user_events_div")){
                $("#user_events_div").empty();
            }
            $("#user_events_div").append(unOrderedList);
    },
    createUserRecievedEventsView:function(){
        console.log("@feed-view -- Creating user recieved events");
        var finalResponseJson = localStorage["user_recieved_events"];
        var parsedData = JSON.parse(finalResponseJson);
        var unOrderedList = '<ul id="recieved_events_ul">';
        for(i = 0 ; i<parsedData.length ; i++){
           var obj = parsedData[i];
            var actorName = obj["actor"]["login"];
            var actorGitURL = gitHubURL + actorName;
            var actorAvatarUrl = obj["actor"]["avatar_url"];
            var type = obj["type"];
            var repoName = obj["repo"]["name"];
            var payload = obj["payload"];
            var pullRequest = payload["pull_request"];
            var action = FEEDVIEW.getAction(type,repoName,payload);
            var pushEventBranchName = FEEDVIEW.getPushEventBranchName(payload);
            var listItem = '<li class="box"><a class="hover_img" href=' + actorGitURL + delimiter + 'target="_blank">' 
                             + actorName + '<span><img src="' +actorAvatarUrl + '" alt="image" height="100"/></span></a>' + delimiter + '<i>' + action +'</i>' 
                             + delimiter + '</li>';
            unOrderedList = unOrderedList + listItem ;
        }
        unOrderedList = unOrderedList + '</ul>';
        if($("#user_events_div")){
            $("#user_events_div").empty();
        }
        $("#user_events_div").append(unOrderedList);
        FEEDVIEW.addTipFunctionality();
    },
    getAction: function(type,repoName,payload){
        var action = UNDEFINED;
        var str = UNDEFINED;
        switch(type){
            case "PushEvent":
                action = actionMap[type];
                var branchName = FEEDVIEW.getPushEventBranchName(payload);
                var repoURL = gitHubURL + repoName;
                var branchURL = repoURL + "/tree/" + branchName;
                str = '<b><i>' + action + '</i></a>' + delimiter + 
                      ' <a href=' + branchURL + delimiter +'target="_blank">'+ branchName + '</a>' +
                      ' at ' + '<a href=' + repoURL + delimiter + 'target="_blank">' + repoName + '</a>';
                break;
            case "PullRequestEvent":
                action = FEEDVIEW.getPullRequestAction(payload);
                var pullRequestURL = FEEDVIEW.getPullRequestURL(payload);
                var pullRequestNumber = FEEDVIEW.getPullRequestNumber(payload);
                str = '<b><i>' + action + '</i></a>' + delimiter + 
                      " pull request " + ' <a href=' + pullRequestURL + delimiter +'target="_blank">'+ repoName +'#' + pullRequestNumber + '</a>' ;
                break;
            case "PullRequestReviewCommentEvent":
                action = actionMap[type];
                var pullRequestReviewCommentURL = FEEDVIEW.getPullRequestReviewCommentURL(payload);
                var pullRequestReviewCommentPullNumber = FEEDVIEW.getPullRequestReviewCommentPullNumber(payload);
                var comment = payload["comment"]["body"].toString();
                str = '<b><i><b class="showTip" alt="' + comment +'">' + action + '</b></i></b></a>' + delimiter + 
                      ' <a href=' + pullRequestReviewCommentURL + delimiter +'target="_blank">'+ repoName +'#' + pullRequestReviewCommentPullNumber + '</a>';
                break;
            case "IssueCommentEvent":
                action = actionMap[type];
                var issueCommentEventURL = FEEDVIEW.getIssueCommentEventURL(payload);
                var issueCommentEventNumber = FEEDVIEW.getIssueCommentPullNumber(payload);
                var comment = payload["comment"]["body"].toString();
                str = '<b><i><b class="showTip" alt="' + comment + '">' + action + '</b></i></b></a>' + delimiter + 
                      '<a href=' + issueCommentEventURL + delimiter +'target="_blank">'+ repoName + '#' + issueCommentEventNumber + '</a>';
                break;
            case "CreateEvent": 
                action = FEEDVIEW.getCreateEventAction(payload,type);
                var ref = payload["ref"];
                var ref_type = payload["ref_type"];
                var repoURL = gitHubURL + repoName;
                var branchURL = repoURL + "/tree/" + ref;
                str = '<b><i>' + action + '</i></a>' + delimiter +
                       ref_type + delimiter + 
                       '<a href=' + branchURL + delimiter +'target="_blank">'+ ref + '</a>';
                break;
            case "MemberEvent":
                  action =  payload["action"];
                  var member = payload["member"]["login"];
                  var repoURL = gitHubURL + repoName;
                  var memberAvatarURL = payload["member"]["avatar_url"];
                  var memberGitURL = gitHubURL + member;
                  str = '<b><i>' + action + '</i></b></a>' + delimiter +
                       '<a class="hover_img" href=' + memberGitURL + delimiter +'target="_blank">'+ member + 
                        '<span><img src="' + memberAvatarURL + '" alt="image" height="100"/></span></a>' +
                        delimiter + 'to' +  delimiter + 
                       '<a href=' + repoURL + delimiter +'target="_blank">'+ repoName +   '</a>';
                break;
            case "PublicEvent":
                break;
            case "IssuesEvent":
                action  =  payload["action"];
                var eventType = actionMap[type];
                var issueUrl = payload["issue"]["html_url"];
                var memberGitURL = gitHubURL + member;
                var issueNumber = payload["issue"]["number"];
                var repoURL = gitHubURL + repoName;
                str = '<b><i>' + action + '</i></b></a>' + delimiter +
                        eventType + delimiter + 
                         '<a href=' + issueUrl + delimiter +'target="_blank">'+ repoName +'#' + issueNumber +   '</a>';
                break;
            case "ForkEvent":
                action =  actionMap[type];
                var repoURL = gitHubURL + repoName;
                var forkeeFullName = payload["forkee"]["full_name"];
                var forkeeURL = gitHubURL +  payload["forkee"]["full_name"] ;
                str = '<b><i>' + action + '</i></b></a>' + delimiter +
                      '<a href=' + repoURL +'>'+ repoName +  '</a>' +
                       delimiter + "to" + delimiter + 
                       '<a href=' + forkeeURL + delimiter +'target="_blank">'+ forkeeFullName +  '</a>';
                break;
            case "DeleteEvent":
                action = actionMap[type];
                var refType = payload["ref_type"];
                var ref = payload["ref"];
                var repoURL = gitHubURL + repoName;
                str = '<b><i>' + action + '</i></a>' + delimiter + 
                        refType + delimiter + ref + delimiter + 'at' + 
                       '<a href=' + repoURL + delimiter +'target="_blank">'+ repoName + '</a>' ;
                break;
            case "ReleaseEvent":
                 action = actionMap[type];
                 var releaseName = payload["release"]["name"];
                 var releaseURL = payload["release"]["html_url"];
                 var repoURL = gitHubURL + repoName;
                 str = '<b><i>' + action + '</i></a>' + delimiter + 
                       '<a href=' + releaseURL + delimiter +'target="_blank">'+ releaseName + '</a>' + delimiter +
                       ' at ' + '<a href=' + repoURL + delimiter +'target="_blank">'+ repoName + '</a>';
                break;
        }
        return str;
    },
    getCreateEventAction: function(payload,type){
        var actionName = actionMap[type] ;
        return actionName;
    },
    getPullRequestAction: function(payload){
        var actionName ;
        switch(payload["pull_request"]["state"]){
            case "open":
                actionName = payload["action"];
                break;
            case "closed":
                if(payload["pull_request"]["merged_at"]){
                    actionName = "merged";
                }else{
                    actionName =  payload["action"];
                }
                break;
        }
        return actionName;
    },
    getIssuesEventAction: function(payload){
        return payload["action"];
    },
    getPullRequestURL: function(payload){
        if(payload["pull_request"]){
            return payload["pull_request"]["html_url"];
        }
    },
    getPullRequestNumber: function(payload){
        if(payload["pull_request"]){
            return payload["pull_request"]["number"];
        }
    },
    getPullRequestState: function(payload){
        if(payload["pull_request"]){
            return payload["pull_request"]["state"];
        }
    },
    getPullRequestTitle: function(payload){
        if(payload["pull_request"]){
            return payload["pull_request"]["title"];
        }
    },
    getPushEventBranchName: function(payload){
        var branchName = UNDEFINED;
        if(payload["ref"]){
            var indexPosition = payload["ref"].lastIndexOf("/");
            branchName = payload["ref"].substring(indexPosition+1,payload["ref"].length);
        }
        return branchName;
    },
    getPullRequestReviewComment: function(payload){
        if(payload["comment"]){
            return payload["comment"]["body"];
        }
    },
    getPullRequestReviewCommentURL: function(payload){
        if(payload["comment"]){
            return payload["comment"]["html_url"];
        }
    },
    getPullRequestReviewCommentPullNumber: function(payload){
        var urlNumber = UNDEFINED;
        if(payload["comment"]){
            var url = payload["comment"]["pull_request_url"];
            var indexPosition = url.lastIndexOf("/");
            var urlNumber = url.substring(indexPosition+1,url.length);
        }
        return urlNumber;
    },
    getIssueCommentEventURL: function(payload){
        if(payload["comment"]){
            return payload["comment"]["html_url"]; 
        }
    },
    getIssueCommentPullNumber: function(payload){
        var urlNumber = UNDEFINED;
        if(payload["comment"]){
            var url = payload["comment"]["issue_url"];
            var indexPosition = url.lastIndexOf("/");
            urlNumber = url.substring(indexPosition+1,url.length);
        } 
        return urlNumber;
    },
    getIssueCommentEventTitle: function(payload){
        if(payload["comment"]){
            return payload["comment"]["body"];
        }
    },
    getCreateEventRefType: function(payload){
        if(payload["ref_type"]){
            return payload["ref_type"];
        }
    },
    getCreateEventRef: function(payload){
        if(payload["ref"]){
            return payload["ref"];
        }
    },
    validateLoginForm:function(){
        var bool = true;
        if($("#user_name_field").val().trim() == ''){
            $("#user_name").addClass('has-error');
            bool = false;
        }else{
            $("#user_name").removeClass('has-error');
        }
        if($("#user_github_token_field").val().trim() == ''){
            $("#user_github_token").addClass('has-error');
            bool = false;
        }else{
             $("#user_github_token").removeClass('has-error');
        }
        return bool;
    },
    showMessage:function(msg, element){
            var element = "#" + element ;
            $(element).html(msg);
    },
    createUserTabs:function(statusCode){
        console.log("@feed-view -- Creating tabs.");
        if(statusCode == parseInt("200")){
            console.log("Hiding...");
            $('.container').hide();
            $('.main').show();
            $('.header').show();
        }else{
            console.log("Not hiding...");
        }
    },
    createUserProfileView:function(){
        console.log("@feed-view -- Creating view for user profile");
        var finalResponseJson = localStorage["user_info"];
        var parsedData = JSON.parse(finalResponseJson);
        var finalParsedJSon = JSON.parse(parsedData);
        var imageURL = finalParsedJSon["avatar_url"];
        var loginName = finalParsedJSon["login"];
        var profileURL = finalParsedJSon["html_url"];
        var fullName = finalParsedJSon["name"] == undefined ? loginName : finalParsedJSon["name"] ;
        var email = finalParsedJSon["email"];
        var location = finalParsedJSon["location"];
        var image = '<a href="' + profileURL + '" target="_blank"><span><img src="' + imageURL + '" alt="image" height="200"/></span></a>';
        var profileLink = '<a href="' + profileURL + '" target="_blank">' + fullName + '</a>';
        var profileTable = '<table border="0"  align="left"><tr><th class="table_header" colspan="3">' + profileLink
                            +'</th></tr><tr><td  rowspan="4" border=3 height=200 width=200>' + image +'</td><td class="table_column"> Login Name:</td><td><b> '+ loginName + '</b></td></tr>'
                            + '<tr><td class="table_column">Email:</td><td><b>' + email + '</b></td></tr>'
                            + '<tr><td class="table_column">Location:</td><td><b>' + location + '</b></td></tr>'
                            + '<tr><td class="table_column">Github Token: </td><td>' + '<input type="text" id="user_token" style="width:390px;" placeholder="' +  localStorage["user_api_token"] +  '"></td></tr>'
                            + '<tr><td class="table_column"></td><td class="table_column"><button type="button" class="btn btn-primary" id="save_token" >Save New Token</button></td>'  
                            +  '<td class="table_column"><button type="button" class="btn btn-primary btn-large" id="cancel_token" >Cancel</button></td></tr>'
                            + '</table>' ;
        
        $('#user_avatar_div').html(profileTable);

        $("#cancel_token").click(function(){
            $("#user_token").val("");
        });

        $("#save_token").click(function(){
            var newToken = $("#user_token").val().trim();
            localStorage["user_api_token"]  = newToken;
            $("#user_token").val("");
            $("#user_token").attr("placeholder", newToken);
        });
    },
    createUserRepositoriesView:function(){
        console.log("@feed-view -- Creating view for user repos");
        var finalResponseJson = localStorage.getItem("user_repositories");
        var finalParsedJSon = JSON.parse(finalResponseJson);
        //clear the old list before creating a new one
        if($("#user_repo_ul")){
                $("#user_repo_ul").empty();
        }
         for(i = 0 ; i < finalParsedJSon.length ; i++){
            var val = finalParsedJSon[i];
            var list ;
            var uList ;
            list = '<li class="parent box" repo='+ '"true" id="'+ i +"_" + val["id"] + '_list_element_repo"' + '  html_url="' + val["html_url"] + '"  title="'+ val["name"] + '"><a>' + val["name"] + '</a><ul><div id="' + i +"_" + val["id"] +"_list_element_repo_div" + '" > <table><tr><td> Loading...</td></tr></table></div>';
            uList = '<li class="parent box" id="' + i +"_" + val["id"] + '_list_element_repo_child">' + '</li>';
            list = list + uList;
            list = list + '</ul></li>';
            $("#user_repo_ul").append(list); 
         }
        $( '.tree li.parent ' ).click( function( ) {
                  if($(this).attr('repo') === "true"){
                     var id = this.id ;
                     var child = "#" + id + '_child';
                     var htmlURL = $(this).attr('html_url') ;
                     var title = $(this).attr('title');
                     var loadDiv = "#" + id + '_div';
                     $(loadDiv).show();
                     var URL = baseURL + "repos/" + localStorage["user_id"] +"/" + title + "?access_token="+localStorage["user_api_token"] ;
                     $.ajax({url:URL,success:function(result){
                        var parentFullName =  result["parent"] ? result["parent"]["full_name"] : "";
                        var parentHtmlUrl = result["parent"] ? result["parent"]["html_url"] : "";
                        var ulist = '<li class="box">' +'<a class="hover_img" href="' + htmlURL  + '" target="_blank">' + '<i><b>' + "..forked from " +'</b></i>'+'</a>'+ '<a class="hover_img" href=' + parentHtmlUrl +  delimiter + 'target="_blank">' +  parentFullName +'</a></li>';
                        $(child).html(ulist);
                        $(loadDiv).hide();
                    }});
                  }
        }); 
    },
    showNotifications:function(notificationTitle,notificationMessage,url){
        console.log("@Showing notifications.." + url);
        var opt = {
          type: "basic",
          title: notificationTitle,
          message: notificationMessage,
          iconUrl: notificationimgSrc
        };

        var id = Math.random() + "1";
        // chrome.notifications.create(id, opt, function(){});
        // chrome.notifications.onClicked.addListener(function(id){
        //     window.open(url);
        // });
        //Sample Code
              // Let's check if the browser supports notifications
              if (!("Notification" in window)) {
                alert("This browser does not support desktop notification");
              }
              // Let's check if the user is okay to get some notification
              else if (Notification.permission === "granted") {
                // If it's okay let's create a notification
                chrome.notifications.create(id, opt, function(){});
                chrome.notifications.onClicked.addListener(function(id){
                   window.open(url);
                });
              }
              // Otherwise, we need to ask the user for permission
              // Note, Chrome does not implement the permission static property
              // So we have to check for NOT 'denied' instead of 'default'
              else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {

                  // Whatever the user answers, we make sure we store the information
                  if(!('permission' in Notification)) {
                    Notification.permission = permission;
                  }

                  // If the user is okay, let's create a notification
                  if (permission === "granted") {
                    chrome.notifications.create(id, opt, function(){});
                    chrome.notifications.onClicked.addListener(function(id){
                         window.open(url);
                     });
                  }
                });
              }
              // chrome.notifications.onButtonClicked.addListener(function(){
              //    window.open("http://google.com/");
              // });
              // At last, if the user already denied any notification, and you 
              // want to be respectful there is no need to bother him any more.
        //Sample Code
    },
    addToggleFunctionality:function(){
         $( '.tree li.parent > a' ).click( function( ) {
                   $( this ).parent().toggleClass( 'active' );
                   $( this ).parent().children( 'ul' ).children( 'li').addClass('show');
                   $( this ).parent().children( 'ul' ).slideToggle( 'slow' );
         });   
    },
    addTipFunctionality:function(){

            //Comment tip functionality
        $.fn.extend({
                tip: function (options) {
                    var defaults = {
                        maxWidth: '400px',
                        offset: 20,
                        theme: 'blueTip'
                    };

                    /*
                    extend the options
                    */
                    var options = $.extend(defaults, options);


                    return this.each(function () {
                        var o = options;
                        var instance = $(this);
                        var theme = o.theme;

                        instance.hover(function () {
                            var item = $(this);
                            tip = $('<div id=\'tip\'><p>' + item.attr('alt') + '</p></div>');
                            tip.addClass(o.theme).appendTo('body');
                            tip.show();
                        },

                function () {
                    tip.hide();
                }).mousemove(function (e) {

                    var offset = 20;
                    var xCord = e.pageX + offset; //Get X coodrinates
                    var yCord = e.pageY + offset; //Get Y coordinates
                    if (typeof tip != 'undefined') {
                        var tipWidth = tip.width(); //Find width of tooltip
                        if (tip.width() > parseInt(o.maxWidth, 10)) {
                            tip.width(o.maxWidth);
                        }

                        var tipHeight = tip.height(); //Find height of tooltip
                        var distFromRight = $(window).width() - (xCord + tipWidth);
                        var disFromBottom = $(window).height() - (yCord + tipHeight);

                        //If there is not enough space on the right or bottom side just flip it
                        if (distFromRight < offset) {
                            xCord = e.pageX - tipWidth - offset;
                        } if (disFromBottom < offset) {
                            yCord = e.pageY - tipHeight - offset;
                        }
                        tip.css({ left: xCord, top: yCord });
                    }
                });
                    });
                }
            });

      $('.showTip').tip(); 

    //Comment tip functionality

    },
    createUserNotificationsView:function(){
        console.log("@feed-view -- List of userNotifications");
        var finalResponseJson = localStorage.getItem("user_notifications");
        var finalParsedJSon = JSON.parse(finalResponseJson);
        //clear the old list before creating a new one
        if($("#user_notification_ul")){
             $("#user_notification_ul").empty();
        }
        for(var key in finalParsedJSon){
            if(finalParsedJSon.hasOwnProperty(key)){
                var val = finalParsedJSon[key];
                var list ;
                var uList ;
                if( val.length > 0){
                    list = '<li class="parent box"><a>' + val[0].repo_name + '</a><ul>';
                }
                for(i = 0 ; i < val.length; i++){
                  uList = '<li class="parent box" url="' + val[i].latest_comment_url +'"id="'+ i + "_" + val[i].id +"_list_element"+ '" title="'+ val[i].subject_title + '" style="display:item-list;"><a>' + val[i].subject_title + '</a>';
                  uList =  uList + '<ul id='+ i +"_" + val[i].id +'_list_element_child' + '></ul></li><div id="' + i +"_" + val[i].id +"_list_element_div" + '" style="display:none;" > <table><tr><td> Loading...</td></tr></table></div>';
                  list = list + uList; 
                }
                list = list + '</ul></li>';
                $("#user_notification_ul").append(list); 
            }
        }
          $("li.parent").click(function() { 
            if(this.id.length > 0){
                var id = this.id ;
                var title = $(this).attr('title');
                var child = "#" + id + '_child';
                var URL = $(this).attr("url") + "?access_token=" +  localStorage["user_api_token"] ;
                var loadDiv = "#" + id + '_div';
                $(loadDiv).show();
                $.ajax({url:URL,success:function(result){
                    var response = {};
                    response["html_url"] = result["html_url"];
                    response["user_id"] = result["user"]["login"] != "undefined" ? result["user"]["login"] : "";
                    response["user_profile"] = result["user"]["html_url"];
                    response["avatar_url"] = result["user"]["avatar_url"];
                    var email = '<a style="padding: 0 0 0 5px;" href="mailto:' + response["user_id"] + corpExtension + '?subject=' + title + '&body=' + response["html_url"] +'"  class="email">' +'<img src="' + emailImgSrc + '" /></a>';
                    var chat = '<a style="padding: 0 0 0 5px;" href="sip:' + response["user_id"] + chatCorpExtension + '" class="chat">' +'<img src="' + chatIconImgSrc + '" /></a>';
                    var ulist = '<li class="parent"><a class="hover_img" href=' + response["user_profile"] +  delimiter + 'target="_blank">' +  response["user_id"] + '<span><img src="'+ response["avatar_url"] + '" alt="image" height="100"/></span></a>' +
                                '<a href=' + response["html_url"] + delimiter + 'target="_blank"><i>' + "Files Changed"  + '</i></a>' 
                                +delimiter + email + chat + '</li>';
                     $(child).html(ulist);
                     $(loadDiv).hide();
                 }});
               }
           });
         //FEEDVIEW.addToggleFunctionality();
    }
};
 
  $( document ).ready( function( ) {

    //Hide the sign out button initially 
    $("#sign-out").hide();
    //Comment Hover functionality
     $(".comment_hover").hover(
      function() { $(this).children('.comment_actions').show(); },
      function() { $(this).children('.comment_actions').hide(); }
     );


    //Comment Hover functionality
    $("#reset_button").click(function(){
        $('#login_form').data('bootstrapValidator').resetForm(true);
        $("#panel_heading").html("");
    });
   
    $('.email').click(function(){
        var myWindow = window.open("mailto:kratra.kumar.ratra@gmail.com?subject=Git hub feed reader.", "", "width=200, height=100");
        myWindow.document.write("<p>Opening mail client!!</p>");
        setTimeout(function(){ myWindow.close() }, 2000);
    });

    $("#close").click(function(){
        window.close();
    });

    $("#sign-out").click(function(){
        //clear all the list
        // $("#user_notification_ul").empty();
        // $("#user_events_div").empty();
        // $("#user_repo_ul").empty();
        // $("#profile_table").html("");

        //clear all the cache from chrome
        // localStorage["temp_user_notifications"] = "";
        // localStorage["temp_user_recieved_events"] = "";
        // localStorage["temp_user_repositories"] = "";
        // localStorage["user_api_token"] = "";
        // localStorage["user_notifications"] = "";
        // localStorage["user_recieved_events"] = "";
        // localStorage["user_repositories"] = "";

        localStorage["user_info"] = "";
        localStorage["user_api_token"] = "";
        localStorage["user_id"] = "";
        $("#user_events_div").hide();
        $("#user_notifications_div").hide();
        $("#my_repositories_div").hide();
         $("#my_profile_div").hide();
        $("#sign-out").hide();
        $('.header').hide();
        $("#login_form").show();
        $("#reset_button").click();
    });

    $( '.tree li' ).each( function() {
        if( $( this ).children( 'ul' ).length > 0 ) {
            $( this ).addClass( 'parent' );     
        }
    });

 /*$( '.tree li.parent > a' ).click( function( ) {
          $( this ).parent().toggleClass( 'active' );
          $( this ).parent().children( 'ul' ).slideToggle( 'fast' );
 });*/
                
    $( '#all' ).click( function() {
          $( '.tree li' ).each( function() {
               $( this ).toggleClass( 'active' );
               $( this ).children( 'ul' ).slideToggle( 'slow' );
           });
    });
    
    $( '.tree li.parent > a' ).click( function( ) {
        $( this ).parent().toggleClass( 'active' );
        $( this ).parent().children( 'ul' ).slideToggle( 'slow' );
    });    
    
     //check if the user is already logged in
    if(localStorage["user_info"] != undefined && localStorage["user_info"].length > 0){
        $("#login_form").hide();
        //Call this for now and later replace it with the saved setting in localStorage
            console.log("Creating views..");
            $("#sign-out").show();
            FEEDVIEW.createUserRecievedEventsView();
            FEEDVIEW.createUserNotificationsView();
            FEEDVIEW.createUserRepositoriesView();
            FEEDVIEW.createUserProfileView();
            FEEDVIEW.addToggleFunctionality();
    }else{
        $("#login_form").show();
        $(".main").show();
        $('.header').hide();
    }

    //form validations
        $("#login_form").bootstrapValidator({
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            userName: {
                validators: {
                    stringLength: {
                        min: 1,
                        max: 50,
                        message: 'The user name must be less than 50 characters'
                    }
                }
            },
            gitHubToken: {
                validators: {
                    stringLength: {
                        min: 1,
                        max: 200,
                        message: 'The token must be less than 200 characters'
                    }
                }
            }
        }
    }).on('success.form.bv', function(e) {

        // Prevent form submission
        e.preventDefault();

        // Get the form instance
        var $form = $(e.target);

        // Get the BootstrapValidator instance
        var bv = $form.data('bootstrapValidator');
        var userName = $("#user_name_field").val().trim();
        var token = $("#user_github_token_field").val().trim();
        FEEDCLIENT.validateUserInfo(userName,token,function(status, message){
          console.log("@feed-view- user validation status = " + status);
          if(status === 200){

            if(FEEDCLIENT.getUserRepositories()){
                    FEEDVIEW.createUserProfileView();
                    $(".loader").fadeOut("slow");
                    $("#login_form").hide();
                    $("#panel_heading").html("");
                    $('.main').show();
                    $('.header').show();
                    $("#sign-out").show();
            }
          }else{
            FEEDVIEW.showMessage(message,"panel_heading");
            $(".loader").fadeOut("slow");
          }

        });

    });
    //form validations

    //Tab change notification
          $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
             var target = $(e.target).attr("href");
             var list ;
             switch(target){
                case "#user_events_div":
                      list = $("#recieved_events_ul");
                      break;
                case "#user_notifications_div":
                      list = $("#user_notification_ul");
                      break;
                case "#my_repositories_div":
                      list = $("#user_repo_ul");
                      break;               
             }
             $(list).find("li").slideDown();
             $("#search_box").val("");
             $("#search_box").removeClass('x onX');

             if(target === "#my_profile_div"){
                $("#search_box").hide();
             }else{
                $("#search_box").show();
             }


  });
    //Tab change notification
});


(function ($) {

        //clearable
              function tog(v){return v?'addClass':'removeClass';} 
              
              $(document).on('input', '.clearable', function(){
                $(this)[tog(this.value)]('x');
              }).on('mousemove', '.x', function( e ){
                $(this)[tog(this.offsetWidth-18 < e.clientX-this.getBoundingClientRect().left)]('onX');   
              }).on('click', '.onX', function(){
                $(this).removeClass('x onX').val('').change();
              });
              
        //clearable

      jQuery.expr[':'].Contains = function(a,i,m){
          return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
      };
     
      function listFilter(header, list) {
        var li = $("<li>").attr({"class":"search"}),
            input = $("<input>").attr({"class":"filterinput clearable","type":"text","placeholder":"Search","id":"search_box"});
        $(li).append(input).appendTo(header);
     
        $(input)
          .change( function () {
            var filter = $(this).val();
            var tab = $("ul#github_feed_reader_tabs li.active");
            var currentTab = tab.text();
            if(currentTab){
                var list ;
                switch(currentTab){
                    case "Recieved Events":
                          list = $("#recieved_events_ul");
                          break;
                    case "Notifications":
                          list = $("#user_notification_ul");
                          break;
                    case "Repositories":
                          list = $("#user_repo_ul");
                          break;
                }
                if(list){
                    if(filter) {
                    $(list).find("li:not(:Contains(" + filter + "))").each(function(){
                        var id = $(this);
                        $(id).removeClass('show');
                        $(id).slideUp();
                    });
                    $(list).find("li:Contains(" + filter + ")").each(function(){
                        var id = $(this);
                        $(id).slideDown();
                    });
                       
                    } else {
                     $(list).find("li").slideDown();
                    }
                }
            }
            return false;
          })
        .keyup( function () {
            $(this).change();
        });
      }
    
      $(function () {
        listFilter($("#github_feed_reader_tabs"), $("#list"));
      });
    }(jQuery));


  $( document ).ajaxComplete(function() {
    $('.email').click(function(){
        var hrefString = $(this).attr('href');
        var myWindow = window.open(hrefString, "Opening mail client", "width=200, height=100");
            myWindow.document.write("<p>Opening mail client.Please wait!!</p>");
            setTimeout(function(){ myWindow.close() }, 2000);
        });
    $('.chat').click(function(){
        var hrefString = $(this).attr('href');
        var myWindow = window.open(hrefString, "Opening chat client", "width=200, height=100");
            myWindow.document.write("<p>Opening mail client.Please wait!!</p>");
            setTimeout(function(){ myWindow.close() }, 2000);
        });
  });
     


