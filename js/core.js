var buildPopupAfterResponce = false;
var updateFailed = false;

function SetOption(key, value) {
  localStorage[key] = value;
}
function RemoveQueue(key, value) {
  localStorage[key] = value;
}

function setTheTable() {
  window.retryMilliseconds = localStorage['Global.RetryOnFailure'];
  setupStorage();
  explodedQueues = JSON.parse(localStorage['Global.Queue']);
  for (i=0; i<explodedQueues.length; i++) {
    runtimeStorage.push(new runningQueue(explodedQueues[i].queueIndex, explodedQueues[i].updateInterval, explodedQueues[i].notify, explodedQueues[i].useBadgeCounter));
  }
}

function setDefaultOptions() {
  SetOption('Global.Refresh', 60000);
  SetOption('Global.RetryOnFailure', 10000);
  SetOption('Global.Notifications', true);
  SetOption('OptionsSetup', true);
}

function queue(name, jql) {
  this._name= name;
  this._jql = jql;
  this.getName = function() {
    return this._name;
  };
    this.getJQL = function() {
      return this._jql;
    };
}

function setupStorage() {
  var rs = window.runtimeStorage = [];

  var qs = window.queueStorage = new Array();
  qs.push(new queue('Personal', 'status not in (Closed, Done) AND assignee = '));
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
}

function runningQueue(queueIndex, refresh, notify, useBadge) {
  this.index = queueIndex;
  this.UpdatedAt = null;
  this.UpdateFmt = null;
  this.refreshInterval = refresh;
  this.error = null;
  this.setIconText = useBadge;
  this.notification = notify;
  this.tickets = new Array();
  this.setErorr = function(error) {
    this.error = error;
  };
  
  this.updated = function() {
    this.UpdatedAt = (new Date()).getTime();
    this.UpdateFmt = (new Date()).toISOString();
  };
  this.addTicket = function(ticket) {
    this.tickets.push(ticket);
  };
  this.getQueueSize = function() {
    return this.tickets.length;
  };
    
  this.getRefresh = function() {
    return this.refreshInterval;
  };
  this.getError = function() {
    return this.error;
  };
  this.getName = function() {
    return queueStorage[this.index].getName();
  };
  this.getJQL = function() {
    return queueStorage[this.index].getJQL();
  };
  this.Update = function() {
    if (this.getName() == "Personal") {
      var jiraJQL = (this.getJQL())+localStorage['Global.GWNUser'];
    }
    else {
      jiraJQL = this.getJQL();
    }
    var jiraCon = 'http://services.hq/jira_connector/rest/gwnjc/issues/data?server=http://jira.gwn&query=';
    $.ajax({ 
      dataType: "json",
      context: this,
      url:  jiraCon + encodeURIComponent(jiraJQL), 
      success:  this.ParseJson,
      error:  this.ConnectionError
    });
  };
  this.getLastRefresh = function() {
    return this.UpdatedAt;
  };
  this.ConnectionError = function() {
    this.error = true;
    console.log('Update Failed!');
    if (this.setIcontext) {
      chrome.browserAction.setBadgeBackgroundColor({ color: [110, 140, 180, 255] }); 
      chrome.browserAction.setBadgeText({text: 'R'});
    }
    this.updated();
  };
  this.parseTickets = function(json) {
    var ticketCount = json.length;
    newTickets = [];
    for (i=0; i< ticketCount; i++) {
      item = json[i];
      thisticket = new ticket;
      thisticket.setKey(item.key);
      thisticket.setLink("http://www.jira.gwn/browse/" + item.key);
      thisticket.setSummary(item.summary);
      newTickets.push(thisticket);
    }
    this.CheckTickets(newTickets);
    this.tickets = newTickets;
  };
  this.ParseJson = function(json) {
    if (json.length === 0) {
      console.log("Queue is Empty!! Celebrate");
    }
    this.error = false;
    this.parseTickets(json);
    this.CheckTickets(this.tickets);
    if (this.setIconText) {
      console.log('Setting badge text');
      setBadgeText(this.tickets.length);
    }
    if (buildPopupAfterResponce === true) {
      buildPopup(tickets);
      buildPopupAfterResponce = false;
    }
    this.updated();
  };  
  
  this.CheckTickets = function(newtickets) {
    if (this.tickets.length > 0) {
      console.log(this.tickets.length);
      console.log('Compairing old tickets.');
      for (var i=0; i<newtickets.length; i++) {
        var ticketExists = false;
        for (var j=0; j<this.tickets.length; j++){
          if (newtickets[i].getKey == this.tickets[j].getKey ) {
            ticketExists = true;
          }
        }
        if (!ticketExists && this.notifications) {
          newtickets[i].getDetails();
          sendNotification(newtickets[i]);       
        }
      }
    }
    else { 
      for (i=0; i<newtickets.length; i++) {
        sendNotification(newtickets[i]);
      }
    }
  };
}
function ticket() {
  this._key;
  this._link;
  this._summary;
  this._comment;
  this._time;
  this._timeAgo;

  this.setLink = function(link) {
    this._link = link;
  };
  this.setKey = function(key) {
    this._key = key;
  };
  this.setSummary = function(summary) {
    this._summary = summary;
  };
  this.setComment = function(comment) {
    this._comment = comment;
  };
  this.setTime = function(time) {
    this._time = time;
    this._timeAgo = timeago(time);
  };
  this.getKey = function() {
    return this._key;
  };
  this.getLink = function() {
    return this._link;
  };
  this.getSummary = function() {
    return this._summary;
  };
  this.getComment = function() {
    return this._comment;
  };

  this.getTime = function() {
    return this._time;
  };
  this.getTimeAgo = function() {
    return this._timeAgo;
  };
  this.getError = function() {
    return this._error;
  };
  this.getDetails = function() {
    console.log("getting details for "+ this.getKey());
    var jiraCon = 'http://services.hq/jira_connector/rest/gwnjc/issue/data?server=http://jira.gwn&issue=';
    console.log(this.getKey());
    $.ajax({ 
      url: jiraCon + this.getKey(),
      context: this,
      dataType: 'json',
      success: function(json) {
        var numComments = json.comments.length;
        var commentDate = json.comments[numComments-1].date;
        var lastcomment = json.comments[numComments-1].body;
        var dateFormatted=new Date(commentDate);
        ticketTime = $.timeago(dateFormatted);
        refcomment = lastcomment.replace(/[\n\r]/g, '');
        if (refcomment.length>'120') {
          this.setComment(refcomment.substring(0,120) + '...');
        }
        else {
          this.setComment =(refcomment);
        }
        console.log(this.getKey()+" is updated");
        this._timeago = ticketTime;
        this._time = commentDate;
      }
    });
  };
}
function savedQueue() {
  this.queueIndex = null;
  this.notify = null;
  this.useBadgeCounter = null;
  this.updateInterval = null;
}

function saveQueueOptions(queue) {
  localStorage['Global.Queue'];
}

function setBadgeText(ticketCount) {
    if (ticketCount === 0) {
      chrome.browserAction.setBadgeBackgroundColor({ color: [200, 0, 0, 255] }); 
      chrome.browserAction.setBadgeText({text: ''}); 
    }
    else {
      chrome.browserAction.setBadgeBackgroundColor({ color: [200, 0, 0, 255] }); 
      chrome.browserAction.setBadgeText({text: ticketCount.toString()});
    }
}

function UpdateIfReady(force) {
  if (typeof runtimeStorage != 'object') {
    setupStorage();
  };
  for (i=0;i<runtimeStorage.length; i++) {
    $queue = runtimeStorage[i];
    lastRefresh = $queue.getLastRefresh(); 
    interval = ($queue.getError() ? retryMilliseconds : $queue.getRefresh());
    currTime = parseFloat((new Date()).getTime()); 
    console.log('Updating '+ $queue.getName() + " in: " + parseInt(( (lastRefresh+interval)-(currTime)  )/1000)+" sec.");
    if ((force === true) || (lastRefresh === null)) {
      console.log("Forcing update to " + $queue.getName());
      $queue.Update();
    }
    else if(currTime >= lastRefresh+interval) {
        console.log("Time to update "+ $queue.getName());
        $queue.Update();    
    }
  }
}

function sendNotification(ticket) {
  var toast = webkitNotifications.createNotification(
    'images/icon.png',
    "New Ticket",
    ticket.getKey() + " " + ticket.getSummary()
    );
  toast.addEventListener('click', function() {
    toast.cancel();
    window.open(ticket.getLink());
  });
  toast.show();
  setTimeout(function () { toast.cancel() }, 5000);
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
  if (url.indexOf("http:") !== 0 && url.indexOf("https:") !== 0) {
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
function toggle(id) {
  var e= document.getElementById(id);
  if(e.style.display == 'block') {
    e.style.display = 'none';
  }
  else {
    e.style.display = 'block';
  }
}

var _gaq = _gaq || []; 
_gaq.push(['_setAccount', 'UA-46802132-2']);
_gaq.push(['_trackPageview']);
 
(function() {
  var ga = document.createElement('script'); 
      ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; 
      s.parentNode.insertBefore(ga, s); 
})();
