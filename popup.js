window.onload = function() {
  main();
  setupEvents();
}

function setupEvents() {
  $('#refresh').click(refreshTickets);
  $('a#options').click(function() {
    openOptions();
  });
}

function main() {
  if (localStorage['ESM.NumTickets'] == null) {
    buildPopupAfterResponce = true;
    UpdateFeed();
  }
  else if (localStorage['ESM.error'] != "null") { 
    var feed = document.getElementById('feed');
    var span = document.createElement('span');
     span.classname = 'Error';
     span.innerText = localStorage['ESM.error'];
    feed.appendChild(span);
  }
  else {
    buildPopup(RetrieveTicketsFromLocalStorage());
  }
}

function buildPopup(tickets) {
  var header = document.getElementById('header');
  var feed = document.getElementById('feed');
  var ticketLink = document.getElementById('issues');
  ticketLink.addEventListener('click', openLinkFront);
  
  var timeSince = $.timeago(localStorage['ESM.FLastRefresh']);
  var addTime = document.createElement('span');
   addTime.classname = 'timesince';
   addTime.innerText = timeSince;
  header.appendChild(addTime);
  var title = document.getElementById('title');
  title.addEventListener('click', openLink);

  for (var i=0; i<tickets.length; i++) {
    esmTickets = tickets[i];
    var row = document.createElement('tr');
    row.classname = "ticket";
    var num = document.createElement('td');
    num.innerText = i+1;
    var link_col = document.createElement('td');
    var title = document.createElement('a');
      title.classname = 'ticket_number';
      title.innerText = esmTickets.key + " | " + esmTickets.summary;
      title.href = esmTickets.link;
      title.addEventListener('click', openLink);
    var time = document.createElement('span');
      time.className = "time";
      time.innerText = "  |  " + esmTickets.time;
    link_col.appendChild(title);
    link_col.appendChild(time);
    row.appendChild(num);
    row.appendChild(link_col);
    feed.appendChild(row);
  }
  hideElement('spinner');
  showElement('container');
}

function refreshTickets() {
   var ticketTable = document.getElementById('feed');
  while(ticketTable.hasChildNodes()) {
    ticketTable.removeChild(ticketTable.firstChild);
  }
  toggle('container');
  toggle('spinner');
  buildPopupAfterResponce = true;
  UpdateFeed();
  UpdateLastRefreshTime();
}
