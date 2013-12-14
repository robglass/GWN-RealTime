var buildPopupAfterResponce = false;
var retryMilliseconds = 1000;

function SetInitalOption(key, value) {
    localStorage[key] = value;
}

function UpdateIfReady(force) {
  var lastRefresh = parseFloat(localStorage["GWNRT.LastRefresh"]);
  var interval = parseFloat(localStorage["GWNRT.RequestInterval"]);
  var nextRefresh = lastRefresh +interval;
  var currTime = parseFloat((new Date()).getTime());
  var isReady = (currTime > nextRefresh);
  var isNull = (localStorage["GWNRT.LastRefresh"] == null);
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
  localStorage.clear();
  chrome.browserAction.setBadgeText({text: ''});
  if (buildPopupAfterResponce) {
    buildPopupE('Connection to ESM failed, please verify connection to services.hq');
    buildPopupAfterResponce = false;
  }
  //localStorage["GWNRT.LastRefresh"] = localStorage["GWNRT.LastRefresh"] + retryMilliseconds;
}

function CheckTickets(tickets) {
  var oldTickets = RetrieveTicketsFromLocalStorage();
  if ((localStorage["GWNRT.NumTickets"] != 0) && (typeof localStorage["GWNRT.NumTickets"] !== 'undefined')) {
    for (var i=0; i<tickets.length; i++){
      var ticketExists = false
      for (var j=0; j<oldTickets.length; j++){
        if (tickets[i].key == oldTickets[j].key ) {
                  ticketExists = true;
        } 
      }
        if (!ticketExists)
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
  localStorage['GWNRT.error'] = null;
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
  chrome.browserAction.setBadgeText({text: ticketCount.toString()});
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
    'icon.png',
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
  for (var i=0;i<localStorage['GWNRT.NumTickets']; i++) {
    delete window.localStorage['GWNRT.Ticket'+ i];
  } 
}

function SaveTicketsToLocalStorage(tickets) {
  ClearTickets();
  localStorage["GWNRT.NumTickets"] = tickets.length;
  for (var i=0; i<tickets.length; i++) {
   localStorage["GWNRT.Ticket"+ i] = JSON.stringify(tickets[i]); 
  }
}

function RetrieveTicketsFromLocalStorage() {
  var numTickets = localStorage['GWNRT.NumTickets'];
  if (numTickets == null) {
    return null;
  }
  else {
    var tickets = new Array();
    for (var i=0; i<numTickets; i++) {
      tickets.push(JSON.parse(localStorage['GWNRT.Ticket'+i]));
    }
    return tickets;
  }
}

function UpdateLastRefreshTime() {
  localStorage['GWNRT.LastRefresh'] = (new Date()).getTime();
  localStorage['GWNRT.FLastRefresh'] = (new Date().toISOString());
  console.log('Updated');
}

function openOptions() {
  var optionsURL = chrome.extension.getURL('options.html');
  chrome.tabs.create({url: optionsURL});
}

function openLink() {
  openUrl(this.href, (localStorage['GWNRT.BackgroundTabs'] == 'false'));
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
