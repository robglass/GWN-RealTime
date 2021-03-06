var buildPopupAfterResponce = false;
var updateFailed = false;
var _DEBUG_ = false;

function ifdebug(text){
  (_DEBUG_) ? console.log(text) : "";
}
function dbg() {
  (_DEBUG_) ? _DEBUG_ = false : _DEBUG_ = true;
}

function SetOption(key, value) {
  localStorage[key] = value;
}
function RemoveQueue(key, value) {
  localStorage[key] = value;
}

function refreshRuntime() {
    savedOptions = JSON.parse(localStorage['Global.Queue']);
    if (runtimeStorage.length != savedOptions.length) {
      for (var i=0;i<savedOptions.length;i++) {
        if (runtimeStorage[i] == undefined) {
          runtimeStorage.push(new runningQueue(savedOptions[i].queueIndex, savedOptions[i].updateInterval, savedOptions[i].notify, savedOptions[i].useBadgeCounter));
        }
      }
      UpdateIfReady(true);  
    }
    for (var i=0;i<savedOptions.length;i++) {
      if (savedOptions[i].queueIndex == runtimeStorage[i].index) {
        console.log('Updating'+ runtimeStorage[i].getName());
        runtimeStorage[i].useIconText = savedOptions[i].useBadgeCounter;
        runtimeStorage[i].notification = savedOptions[i].notify;
        runtimeStorage[i].refreshInterval = savedOptions[i].updateInterval;
      }
    }
}


function setTheTable() {
  ifdebug("I have set up us the bomb!")
  window.retryMilliseconds = localStorage['Global.RetryOnFailure'];
  window.runtimeStorage = [];
  setupStorage();
  $queues = JSON.parse(localStorage['Global.Queue']);
  for (i=0; i<$queues.length; i++) {  
    runtimeStorage.push(new runningQueue($queues[i].queueIndex, $queues[i].updateInterval, $queues[i].notify, $queues[i].useBadgeCounter));
  }
}

function setDefaultOptions() {
  ifdebug("Setting options to default")
  SetOption('Global.RetryOnFailure', 10000);
  SetOption('Global.Queue', JSON.stringify([]));
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
  ifdebug("Building Array");
  var qs = window.queueStorage = new Array();
  qs.push(new queue('My Queue', 'status not in (Closed, Done) AND assignee = '));
  qs.push(new queue('Implementations', 'assignee = queueimplementations AND status not in (Closed, Done)'));
  qs.push(new queue('Internal Engineering', 'project = ESM AND assignee = unassigned AND status not in (Closed, Done)'));
  qs.push(new queue('Internal IT', 'assignee = queue-desktop AND status not in (Closed, Done)'));
  qs.push(new queue('Linux Admin', 'assignee = queue-linuxadmin AND status not in (Closed, Done)'));
  qs.push(new queue('Network Engineering', 'assignee = "queue - network engineering" and status not in (Closed, Done)'));
  qs.push(new queue('Platform', 'assignee = queue-platform AND status not in (Closed, Done)'));
  qs.push(new queue('PLC Dev.', 'assignee = queueplcdev AND status not in (Closed, Done)'));
  qs.push(new queue('PLS Core', 'assignee = queuetier3coredev AND status not in (Closed, Done)'));
  qs.push(new queue('Project', ' assignee = queue-projects AND status not in (Closed, Done)'));
  qs.push(new queue('Tier 2', 'assignee = queuetier2 AND status not in (Closed, Done)'));
}

function runningQueue(queueIndex, refresh, notify, useBadge) {
  this.index = queueIndex;
  this.UpdatedAt = 0;
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
    ifdebug("Updating "+this.getName());
    if (this.index == 0) {
      if (typeof localStorage['Global.GWNUser'] == undefined || localStorage['Global.GWNUser'] == "") {
        this.missingUser = true;
        return null;
      } else {
        this.missingUser = false;
        var jiraJQL = (this.getJQL())+localStorage['Global.GWNUser'];
      }
    } else {
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
    ifdebug('Update Failed for '+ this.getName());
    if (this.setIconText) {
      ifdebug('Setting badge to "X"');
      chrome.browserAction.setBadgeBackgroundColor({ color: [110, 140, 180, 255] }); 
      chrome.browserAction.setBadgeText({text: 'X'});
    }
    this.updated();
  };
  this.parseTickets = function(json) {
    ifdebug(json)
    var ticketCount = json.length;
    newTickets = [];
    for (i=0; i< ticketCount; i++) {
      item = json[i];
      thisticket = new ticket;
      thisticket.setKey(item.key);
      thisticket.setLink("http://www.jira.gwn/browse/" + item.key);
      if (item.summary.length >= 80){ 
        thisticket.setSummary(item.summary.substring(0,80) + " (cont.)");
      } else {
        thisticket.setSummary(item.summary);
      }
      newTickets.push(thisticket);
    }
    this.CheckTickets(newTickets);
    this.tickets = newTickets;
  };
  this.ParseJson = function(json) {
    if (json.length === 0) {
      ifdebug("Queue is Empty!! Celebrate");
    }
    this.error = false;
    this.parseTickets(json);
    this.CheckTickets(this.tickets);
    if (this.setIconText) {
      ifdebug('Setting badge text for '+this.getName());
      setBadgeText(this.tickets.length);
    }
    this.updated();
  };  
  
  this.CheckTickets = function(newtickets) {
    if (this.tickets.length > 0) {
      ifdebug('Compairing old tickets.');
      for (var i=0; i<newtickets.length; i++) {
        var newticket = true;
        for (var j=0; j<this.tickets.length; j++){
          if (newtickets[i].getKey() == this.tickets[j].getKey() ) {
            newticket = false;
          }
        }
        newtickets[i].getDetails();
        if (newticket && this.notification) {
          sendNotification(newtickets[i], this);       
        }
      }
    }
    else if (this.notification){ 
      ifdebug("Sending Notificaions for all");
      for (i=0; i<newtickets.length; i++) {
        sendNotification(newtickets[i], this);
      }
    }
  };
}
function ticket() {
  this._key;
  this._link;
  this._summary;
  this._comment = "No Comments";
  this._time = "Time not available";
  this._timeago = "";

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
    return this._timeago;
  };
  this.getError = function() {
    return this._error;
  };
  this.getDetails = function() {
    ifdebug("getting details for "+ this.getKey());
    var jiraCon = 'http://services.hq/jira_connector/rest/gwnjc/issue/data?server=http://jira.gwn&issue=';
    $.ajax({ 
      url: jiraCon + this.getKey(),
      context: this,
      dataType: 'json',
      success: function(json) {
        var numComments = json.comments.length;
        if (numComments > 0) { 
          var commentDate = json.comments[numComments-1].date;
          var lastcomment = json.comments[numComments-1].body;
          var dateFormatted=new Date(commentDate);
          ticketTime = $.timeago(dateFormatted);
          refcomment = lastcomment.replace(/[\n\r]/g, '');
          if (refcomment.length>'120') {
            this.setComment(refcomment.substring(0,120) + '...');
          }
          else {
            this.setComment(refcomment);
          }
          this._timeago = ticketTime;
          this._time = commentDate;
        }
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

function setBadgeText(ticketCount) {
    if (ticketCount === 0) {
      ifdebug('Clearing Badge');
      chrome.browserAction.setBadgeBackgroundColor({ color: [200, 0, 0, 255] }); 
      chrome.browserAction.setBadgeText({text: ''}); 
    }
    else {
      ifdebug('Setting badge to ' + ticketCount.toString());
      chrome.browserAction.setBadgeBackgroundColor({ color: [200, 0, 0, 255] }); 
      chrome.browserAction.setBadgeText({text: ticketCount.toString()});
    }
}

function UpdateIfReady(force) {
  ifdebug("Checking timers.")
  if (typeof queueStorage != 'object') {
    setupStorage();
  };
  for (i=0;i<runtimeStorage.length; i++) {
    $queue = runtimeStorage[i];
    lastRefresh = parseInt($queue.getLastRefresh());
    interval = parseInt($queue.getError() ? retryMilliseconds : $queue.getRefresh());
    currTime = parseFloat((new Date()).getTime()); 
    ifdebug($queue.getName() + " will update in: " + parseInt(( (lastRefresh+interval)-(currTime)  )/1000)+" sec.");
    if ((force === true) || (lastRefresh === null)) {
      ifdebug("Forcing update to " + $queue.getName());
      $queue.Update();
    }
    else if(currTime >= lastRefresh+interval) {
        ifdebug("Time to update "+ $queue.getName());
        $queue.Update();    
    }
  }
}

function sendNotification(ticket, queue) {
  ifdebug("Toasting for "+ ticket.getKey());
  var toast = webkitNotifications.createNotification(
    'images/icon.png',
    "New Ticket in " + queue.getName(),
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
  var e = document.getElementsByClassName(id);
  for (var i=0;i<e.length;i++) {
    e[i].style.display = 'none';
  }
}

function showElement(id){
  var e = document.getElementsByClassName(id);
  for (var i=0;i<e.length;i++) {
    e[i].style.display = 'block';
  }
}

function toggle(myclass) {
  var e= document.getElementsByClassName(myclass);
  for (var i=0; i<e.length;i++){
    if(e[i].style.display == 'block') {
      e[i].style.display = 'none';
    }
    else {
      e[i].style.display = 'block';
    }
  }
}

var _gaq = _gaq || []; 
_gaq.push(['_setAccount', 'UA-46802132-3']);
_gaq.push(['_trackPageview']);
 
(function() {
  var ga = document.createElement('script'); 
      ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; 
      s.parentNode.insertBefore(ga, s); 
})();
