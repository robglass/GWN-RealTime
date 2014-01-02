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
  var rs = window.runtimeStorage = [];

  var qs = window.queueStorage = new Array;
  qs.push(new queue('Implementations', 'assignee = queueimplementations AND status not in (Closed, Done)'));
  qs.push(new queue('Internal Engineering', 'project = ESM AND assignee = unassigned AND status not in (Closed, Done)'));
  qs.push(new queue('Internal IT', 'assignee = queue-desktop AND status not in (Closed, Done)'));
  qs.push(new queue('Linux Admin', 'assignee = queue-linuxadmin AND status not in (Closed, Done)'));
  qs.push(new queue('Network Engineering', 'assignee = "queue - network engineering" and status not in (Closed, Done)'));
  qs.push(new queue('Plaform', 'assignee = queue-platform AND status not in (Closed, Done)'));
  qs.push(new queue('PLC Dev.', 'assignee = queueplcdev AND status not in (Closed, Done)'));
  qs.push(new queue('PLS Core', 'assignee = queuetier3coredev AND status not in (Closed, Done)'));
  qs.push(new queue('Project', ' assignee = queue-projects AND status not in (Closed, Done)'));
  qs.push(new queue('Tier 2', 'assignee = queuetier2 AND status not in (Closed, Done)'));
};

function runningQueue(queueIndex) {
  this._index = parseInt(queueIndex);
  this._UpdatedAt = 0;
  this._UpdateFmt = 0;
  this._error = null;
  this.tickets = new Array();
};
runningQueue.prototype.setErorr = function(error) {
  this._error = error;
};
  
runningQueue.prototype.updated = function() {
  this._UpdatedAt = (new Date()).getTime();
  this._UpdateFmt = (new Date()).toISOString();
};
runningQueue.prototype.addTicket = function(ticket) {
  this.tickets.push(ticket);
};
runningQueue.prototype.removeTicket = function(ticket) {
  
};
runningQueue.prototype.getQueueSize = function() {
  return this.tickets.length;
};

runningQueue.prototype.getName = function() {
  return queueStorage[this._index].getName();
};
runningQueue.prototype.getJQL = function() {
  return queueStorage[this._index].getJQL();
};

function ticket() {
  this._key;
  this._link;
  this._summary;
  this._comment;
  this._time;
  this._timeAgo;
};
ticket.prototype.setLink = function(link) {
  this._link = link;
};
ticket.prototype.setKey = function(key) {
  this._key = key;
};
ticket.prototype.setSummary = function(Summary) {
  this._summary = summary;
};
ticket.prototype.setComment = function(comment) {
  this._comment = comment;
};
ticket.prototype.setTime = function(time) {
  this._time = time;
  this._timeAgo = timeago(time);
};
ticket.prototype.getKey = function() {
  return this._key;
};
ticket.prototype.getLink = function() {
  return this._link;
};
ticket.prototype.getSummary = function() {
  return this._summary;
};
ticket.prototype.getComment = function() {
  return this._comment;
};

ticket.prototype.getTime = function() {
  return this._time;
};
ticket.prototype.getTimeAgo = function() {
  return this._timeAgo;
};

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
    UpdateFeed(localStorage['Global.Queue']);
  }
  else {
    if (isReady) {
      UpdateFeed(localStorage['Global.Queue']);    
    }
  }
}

function UpdateFeed(queueIndex) { 
  getOptions();
  window.currentQueue = queueIndex;
  jqlQuery = queueStorage[parseInt(queueIndex)].getJQL();;
  var jiraCon = 'http://services.hq/jira_connector/rest/gwnjc/issues/data?server=http://jira.gwn&query=';
  $.ajax({ 
    dataType: "json",
         url:  jiraCon + encodeURIComponent(jqlQuery), 
     success:  ParseJson,
       error:  ConnectionError
  });
}

function ConnectionError() {
  queueIndex = window.currentQueue;
  console.log('Error retrieving '+queueStorage[queueIndex].getName());
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
  queueIndex = window.currentQueue;
  if (!json) {
    // TODO this.
    console.log("EPIC FAIL");
    return;
  }
  if (json.length == 0) {
    console.log("Queue is Empty!! Celebrate");
  }
  console.log(json);
  console.log(queueIndex);
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
