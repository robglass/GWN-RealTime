var buildPopupAfterResponce = false;
var updateFailed = false;

function SetOption(key, value) {
    localStorage[key] = value;
}
function RemoveQueue(key, value) {
    localStorage[key] = value;
}

function getOptions() {
  window.retryMilliseconds = localStorage['Global.RetryOnFailure'];
  window.notifications = localStorage['Global.Notifications'];
  window.refresh = localStorage['Global.Refresh'];
}

function setDefaultOptions() {
  SetOption('Global.Refresh', 60000);
  SetOption('Global.RetryOnFailure', 10000);
  SetOption('Global.Notifications', true);
  SetOption('OptionsSetup', true);
}

function setupStorage() {
  window.runtimeStorage = new Object;

  window.queueStorage = new Array;
  window.queueStorage.push(new queue('Implementations', 'assignee = queueimplementations AND status was not in (Closed, Done) AND project = TMPLPRJ'));
  window.queueStorage.push(new queue('Internal Engineering', 'project = ESM AND assignee = unassigned AND status was not in (Closed, Done)'));
  window.queueStorage.push(new queue('Internal IT', 'assignee = queue-desktop AND status was not in (Closed, Done) AND project != TMPLPRJ'));
  window.queueStorage.push(new queue('Linux Admin', 'assignee = queue-linuxadmin AND status was not in (Closed, Done) AND project = TMPLPRJ'));
  window.queueStorage.push(new queue('Network Engineering', 'assignee = "queue - network engineering" and status was not in (Closed, Done) and project != TMPLPRJ'));
  window.queueStorage.push(new queue('Plaform', 'assignee = queue-platform AND status was not in (Closed, Done) AND project != TMPLPRJ'));
  window.queueStorage.push(new queue('PLC Dev.', 'assignee = queueplcdev AND status was not in (Closed, Done) AND project = TMPLPRJ'));
  window.queueStorage.push(new queue('PLS Core', 'assignee = queuetier3coredev AND status was not in (Closed, Done) AND project != TMPLPRJ'));
  window.queueStorage.push(new queue('Project', ' assignee = queue-projects AND status was not in (Closed, Done) AND project != TMPLPRJ'));
  window.queueStorage.push(new queue('Tier 2', 'assignee = queuetier2 AND status was not in (Closed, Done) AND project = TMPLPRJ'));
}

function queue(name, jql) {
  this._name= name;
  this._jql = jql;
};
queue.prototype.getName = function() {
    return this._name;
};
queue.prototype.getJQL = function() {
    return this._jql;
};

function UpdateIfReady(force) {
  var lastRefresh = parseFloat(localStorage["Queue.Tier2.LastRefresh"]);
  
  if (updateFailed) {
    var interval = retryMilliseconds;
  }
  else {
      var interval = parseFloat(localStorage["Global.Refresh"]);
  }

  var nextRefresh = lastRefresh +interval;
  var currTime = parseFloat((new Date()).getTime());
  
  console.log('Updating in: ' + parseInt((((parseInt(nextRefresh)) -(parseInt(currTime)))/1000))+" sec.");
  var isReady = (currTime > nextRefresh);
  var isNull = (localStorage["Queue.Tier2.LastRefresh"] == null);
  if ((force == true) || isNull) {
    UpdateFeed();
  }
  else {
    if (isReady) {
      UpdateFeed();    
    }
  }
}

function UpdateFeed() { 
  getOptions();
  var jiraCon = 'http://services.hq/jira_connector/rest/gwnjc/issues/data?server=http://jira.gwn&query=';
  var jqlQuery = 'assignee = queuetier2 AND status in (Open, "In Progress", Reopened, "Ready to Test", "Need Information", "Escalate to Tier 2", "Escalate to Tier 3", "Escalate to Client Services", Testing, Validated, HOLD, Scheduled, Revalidate, "Pending Review", "In Review", "Possible Future Release", "Assigned To Release", "Development Complete", "Ready to Schedule", "Ready to Launch", "Post-Launch Support", "In Discovery", "Requires PLC Update", "Pending Schedule Approval", Draft, "Ready to Order", "Partially Shipped", "Order Placed", "Fully Shipped", "To Do") ORDER BY cf[10142] ASC'
  $.ajax({ 
    dataType: "json",
         url:  jiraCon + encodeURIComponent(jqlQuery), 
     success:  ParseJson,
       error:  ConnectionError
  });
}

function ConnectionError() {
  ClearTickets();
  updateFailed = true;
  console.log('Update Failed!');
  chrome.browserAction.setBadgeBackgroundColor({ color: [110, 140, 180, 255] }); 
  chrome.browserAction.setBadgeText({text: 'X'});
  if (buildPopupAfterResponce) {
    buildPopupE('Connection to ESM failed, please verify connection to services.hq');
    buildPopupAfterResponce = false;
  }
  UpdateLastRefreshTime();
}

function CheckTickets(tickets) {
  if ((localStorage["Queue.Tier2.NumTickets"] != 0) && (typeof localStorage["Queue.Tier2.NumTickets"] !== 'undefined')) {
    console.log('Compairing old tickets.');
    var oldTickets = RetrieveTicketsFromLocalStorage();
    for (var i=0; i<tickets.length; i++){
      var ticketExists = false
      for (var j=0; j<oldTickets.length; j++){
        if (tickets[i].key == oldTickets[j].key ) {
                  ticketExists = true;
        } 
      }
        if (!ticketExists && localStorage['Global.Notifications'] == 'true')
          sendNotification(tickets[i]);       
    }
  }
  else{
    for (var i=0; i<tickets.length; i++){
      sendNotification(tickets[i]);
    }
  }
}

function ParseJson(json) {
  if (!json) {
    // TODO this.
    console.log("EPIC FAIL");
    return;
  }
  if (json.length == 0) {
    console.log("Queue is Empty!! Celebrate");
  }
  //console.log(json);
  updateFailed = false;
  localStorage['Queue.Tier2.Error'] = null;
  var tickets = parseTickets(json);
  CheckTickets(tickets);
  SaveTicketsToLocalStorage(tickets);
  if (buildPopupAfterResponce == true) {
      buildPopup(tickets);
      buildPopupAfterResponce = false;
    }
  UpdateLastRefreshTime();
}

function parseTickets(json) {
  // get the number of ticket and update the badge.
  var ticketCount = json.length;
  if (ticketCount == 0) {
    chrome.browserAction.setBadgeBackgroundColor({ color: [200, 0, 0, 255] }); 
    chrome.browserAction.setBadgeText({text: ''}); 
  }
  else {
    chrome.browserAction.setBadgeBackgroundColor({ color: [200, 0, 0, 255] }); 
    chrome.browserAction.setBadgeText({text: ticketCount.toString()});
  }
  var links = new Array();
  for (var i=0; i< ticketCount; i++) {
    item = json[i];
    ticket= new Object();
    // Get ticket#
    ticket.key = item.key;
    ticket.link = "http://www.jira.gwn/browse/" + item.key;
    // Get Summary
    ticket.summary = item.summary;
    // Get time
    parseMe = getTime(ticket.key);
    comment = parseMe.comment;
    ticket.comment = comment;
    ticket.time = parseMe.time;
    ticket.timeago = parseMe.timeago;
    links.push(ticket);
  }
  return links;
}

function sendNotification(ticket) {
  var toast = webkitNotifications.createNotification(
    'images/icon.png',
    "New Ticket",
    ticket.key + " " + ticket.summary
    );
  toast.addEventListener('click', function() {
    toast.cancel();
    window.open(ticket.link);
  });
  toast.show();
  setTimeout(function () { toast.cancel() }, 5000);
}

function getTime(ticket) {
  var jiraCon = 'http://services.hq/jira_connector/rest/gwnjc/issue/data?server=http://jira.gwn&issue=';
  var ticketDetail = new Object();
  $.ajax({ 
    url: jiraCon + ticket,
    async: false,
    dataType: 'json',
    success: function(json) {
    var numComments = json.comments.length;
    var commentDate = json.comments[numComments-1].date;
    var lastcomment = json.comments[numComments-1].body;
    var dateFormatted=new Date(commentDate);
    ticketTime = $.timeago(dateFormatted);
    refcomment = lastcomment.replace(/[\n\r]/g, '');
    if (refcomment.length>'120') {
    ticketDetail.comment = refcomment.substring(0,120) + '...';
    }
    else {
    ticketDetail.comment = refcomment;
    }
    ticketDetail.timeago = ticketTime;
    ticketDetail.time = commentDate;
    }
  });
  return ticketDetail;
}

function ClearTickets() {
  for (var i=0;i<localStorage['Queue.Tier2.NumTickets']; i++) {
    delete window.localStorage['Queue.Tier2.Ticket'+ i];
  } 
  localStorage['Queue.Tier2.NumTickets'] = null;
}
  
function SaveTicketsToLocalStorage(tickets) {
  ClearTickets();
  localStorage["Queue.Tier2.NumTickets"] = tickets.length;
  for (var i=0; i<tickets.length; i++) {
   localStorage["Queue.Tier2.Ticket"+ i] = JSON.stringify(tickets[i]); 
  }
}

function RetrieveTicketsFromLocalStorage() {
  var numTickets = localStorage['Queue.Tier2.NumTickets'];
  if (numTickets == null) {
    return null;
  }
  else {
    var tickets = new Array();
    for (var i=0; i<numTickets; i++) {
      var storeme = localStorage['Queue.Tier2.Ticket'+ i];
      tickets.push(JSON.parse(storeme));
    }
    return tickets;
  }
}

function UpdateLastRefreshTime() {
  localStorage['Queue.Tier2.LastRefresh'] = (new Date()).getTime();
  localStorage['Queue.Tier2.FLastRefresh'] = (new Date().toISOString());
}

function openOptions() {
  var optionsURL = chrome.extension.getURL('options.html');
  chrome.tabs.create({url: optionsURL});
}

function openLink() {
  openUrl(this.href, (localStorage['Global.BackgroundTabs'] == 'false'));
}

function openLinkFront() {
  openUrl(this.href, true);
}

function openUrl(url, take_focus) {
  if (url.indexOf("http:") != 0 && url.indexOf("https:") != 0) {
    return;
  }
  chrome.tabs.create({url: url, selected: take_focus});
}

function hideElement(id){
  var e = document.getElementById(id);
  e.style.display = 'none';
}

function showElement(id){
  var e = document.getElementById(id);
  e.style.display = 'block';
}
function toggle(id) {;
  var e= document.getElementById(id);
  if(e.style.display == 'block')
    e.style.display = 'none';
  else
    e.style.display = 'block';
}
