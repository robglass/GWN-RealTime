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
  else {
    buildPopup(RetrieveTicketsFromLocalStorage());
  }
}

function buildPopup(tickets) {
  var header = document.getElementById('header');
  var feed = document.getElementById('feed');
  var ticketLink = document.getElementById('issues');
  ticketLink.addEventListener('click', openLinkFront);

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
      title.innerText = esmTickets.key;
      title.href = esmTickets.link;
      title.addEventListener('click', openLink);
    var summary = document.createElement('a');
      summary.className = "summary";
      summary.innerText = ": " + esmTickets.summary;
      summary.href = esmTickets.link;
      summary.addEventListener('click', openLink);
    link_col.appendChild(title);
    link_col.appendChild(summary);
    row.appendChild(num);
    row.appendChild(link_col);
    feed.appendChild(row);
  }
  hideElement('spinner');
  showElement('container');
}

function refreshTickets() {
  console.log("Refreshing");
  var ticketTable = document.getElementById('feed');
  while(ticketTable.hasChildNodes()) ticketTable.removeChild(ticketTable.firstChild);
  toggle('container');
  toggle('spinner');
  buildPopupAfterResponce = true;
  UpdateFeed();
  updateLastRefreshTime();
}
