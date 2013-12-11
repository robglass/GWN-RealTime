var buildPopupAfterResponce = false;

function SetInitalOption(key, value) {
  if (localStorage[key] == null) {
    localStorage[key] = value;
  }
}

function UpdateIfReady(force) {
  var lastRefresh = parseFloat(localStorage["ESM.LastRefresh"]);
  var interval = parseFloat(localStorage["ESM.RequestInterval"]);
  var nextRefresh = lastRefresh +interval;
  var currTime = parseFloat((new Date()).getTime());
  var isReady = (currTime > nextRefresh);
  var isNull = (localStorage["ESM.LastRefresh"] == null);
  if ((force == true) || isNull) {
    UpdateFeed();
  }
  else {
    if (isReady) {
      UpdateFeed();    
    }
  }
}

// TODO need a way to fail gracefully and notify user if unable to connect to ESM
function UpdateFeed() {
  console.log("Updating");
  var jiraCon = 'http://services.hq/jira_connector/rest/gwnjc/issues/data?server=http://jira.gwn&query=';
  var jqlQuery = 'assignee = queuetier2 AND status in (Open, "In Progress", Reopened, "Ready to Test", "Need Information", "Escalate to Tier 2", "Escalate to Tier 3", "Escalate to Client Services", Testing, Validated, HOLD, Scheduled, Revalidate, "Pending Review", "In Review", "Possible Future Release", "Assigned To Release", "Development Complete", "Ready to Schedule", "Ready to Launch", "Post-Launch Support", "In Discovery", "Requires PLC Update", "Pending Schedule Approval", Draft, "Ready to Order", "Partially Shipped", "Order Placed", "Fully Shipped", "To Do") ORDER BY cf[10142] ASC'
  $.getJSON( jiraCon + encodeURIComponent(jqlQuery) , parseJson );
}

function parseJson(json) {
  if (!json) {
    // TODO this.
    console.log("EPIC FAIL");
    return;
  }
  //console.log(json);
  var tickets = parseTickets(json);
  var oldTickets = RetrieveTicketsFromLocalStorage();
  if (localStorage["ESM.NumTickets"] != 0) {
    for (var i=0; i<tickets.length; i++){
      //console.log(tickets[i].key);
      //console.log(oldTickets[i].key);
      if (tickets[i].key != oldTickets[i].key ) {
          sendNotification(tickets[i]);        
      }
    }
  }
  else{
    for (var i=0; i<tickets.length; i++){
      sendNotification(tickets[i]);
    }
  }
  SaveTicketsToLocalStorage(tickets);
  if (buildPopupAfterResponce == true) {
      buildPopup(tickets);
      buildPopupAfterResponce = false;
    }
  localStorage['ESM.LastRefresh'] = (new Date()).getTime();
}

function parseTickets(json) {
  // get the number of ticket and update the badge.
  var ticketCount = json.length;
  //console.log(json.length);
  chrome.browserAction.setBadgeText({text: ticketCount.toString()});
  
  var links = new Array();
  for (var i=0; i< ticketCount; i++) {
    item = json[i];
    var esmTicket= new Object();
    // Get ticket#
    // console.log(item.key);
    esmTicket.key = item.key;
    esmTicket.link = "http://www.jira.gwn/browse/" + item.key;
    //console.log(esmTicket.link);
    // Get Summary
    // console.log(item.summary);
    esmTicket.summary = item.summary;
    // Get time
    esmTicket.time = getTime(esmTicket.key);
    links.push(esmTicket);
  }
  //console.log(links);
  return links;
}

function sendNotification(ticket) {
  var toast = webkitNotifications.createNotification(
    '/icon.png',
    "New Ticket in the Queue",
    ticket.key + " " + ticket.summary
    );
  toast.show();
  setTimeout(function () { toast.cancel() }, 5000);
}

function getTime(ticket) {
  var jiraCon = 'http://services.hq/jira_connector/rest/gwnjc/issue/data?server=http://jira.gwn&issue=';
  var ticketTime = [];
  $.ajax({ 
    url: jiraCon + ticket,
    async: false,
    dataType: 'json',
    success: function(json) {
    var numComments = json.comments.length;
    var commentDate = json.comments[numComments-1].date;
    var dateFormatted=new Date(commentDate.split(' ')[0].split('-').join(',') + ',' + commentDate.split(' ')[1].split('-').join(','));
    ticketTime = $.timeago(dateFormatted);
    }
  });
  return ticketTime;
}

function SaveTicketsToLocalStorage(tickets) {
  localStorage["ESM.NumTickets"] = tickets.length;
  for (var i=0; i<tickets.length; i++) {
   localStorage["ESM.Ticket"+ i] = JSON.stringify(tickets[i]); 
  }
}

function RetrieveTicketsFromLocalStorage() {
  var numTickets = localStorage['ESM.NumTickets'];
  if (numTickets == null) {
    return null;
  }
  else {
    var tickets = new Array();
    for (var i=0; i<numTickets; i++) {
      tickets.push(JSON.parse(localStorage['ESM.Ticket'+i]));
    }
    return tickets;
  }
}

function updateLastRefreshTime() {
  localStorage['ESM.LastRefresh'] = (new Date()).getTime();
}

function openOptions() {
  var optionsURL = chrome.extension.getURL('options.html');
  chrome.tabs.create({url: optionsURL});
}

function openLink() {
  openUrl(this.href, (localStorage['ESM.BackgroundTabs'] == 'false'));
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
function toggle(id) {
  var e= document.getElementById(id);
  if(e.style.display == 'block')
    e.style.display = 'none';
  else
    e.style.display = 'block';
}
