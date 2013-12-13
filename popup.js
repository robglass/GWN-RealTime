window.onload = function() {
  main();
  setupEvents();
}

function setupEvents() {
  $('#refresh').click(refreshTickets);
  $('#options').click(function() {
    openOptions();
  });
  $("#close").click(function() {
    window.close();
  });
}

function main() {
  if (localStorage['GWNRT.NumTickets'] == null) {
    buildPopupAfterResponce = true;
    UpdateFeed();
  }
  else {
    buildPopup(RetrieveTicketsFromLocalStorage());
  }
}

function buildPopupE(error) {
  var feed = document.getElementById('feed');
  var span = document.createElement('span');
    span.className = 'error';
    span.innerText = error;
  feed.appendChild(span);
  showElement('container');
  hideElement('spinner');
}

function buildPopup(tickets) {
  var feed = document.getElementById('feed');
  
  var title = document.getElementById('queuetitle');
  var addtitle = document.createElement('span');
      addtitle.innerText = 'T2 Queue';
  var addnum = document.createElement('span');
      addnum.className = 'unreadCount';
      addnum.innerText = '  (' + localStorage['GWNRT.NumTickets'] + ')';
    title.appendChild(addtitle);
  title.appendChild(addnum);
  if (typeof localStorage['GWNRT.FLastRefresh'] !== 'undefined') {
    var timeSince = $.timeago(localStorage['GWNRT.FLastRefresh']);
    var addTime = document.createElement('span');
      addTime.className = 'timesince emailDetailsTopRight';
      addTime.innerText = timeSince;
    title.appendChild(addTime);
  }



  
    
    for (var i=0; i<tickets.length; i++) {
      esmTickets = tickets[i];
      var ticketblock = document.createElement('div');
      ticketblock.className = "mail vbox hideScrollbars";
      var box = document.createElement('div');
      box.className = 'hbox wide';
      var img = document.createElement('div');
      img.className = 'imageArea vbox';
      var details = document.createElement('div');
      details.className = 'emailDetails vbox wide';
      var unread = document.createElement('span');
      unread.className = 'unread';
      unread.innerText = esmTickets.key;
      var tickettime = document.createElement('div');
      tickettime.className = 'emailDetailsTopRight';
      var date = document.createElement('div');
      date.className = 'date';
      date.innerText = esmTickets.time;
      var timeago = document.createElement('span');
      timeago.className = 'timeAgo';
      timeago.innerText =  ' (' + esmTickets.timeago + ')';
      var box2 = document.createElement('div');
      box2.className = 'hbox';
      var subject = document.createElement('div');
      subject.className = 'subject';
      subject.innerText = esmTickets.summary;
      var notes = document.createElement('div');
      notes.className = 'summary vbox';
      notes.innerText = esmTickets.comment;
    
      ticketblock.appendChild(box);
      box.appendChild(img);
      img.appendChild(details);
      details.appendChild(unread);
      details.appendChild(tickettime);
      details.appendChild(box2);
      box2.appendChild(subject);
      details.appendChild(notes);
      tickettime.appendChild(date);
      date.appendChild(timeago);
      feed.appendChild(ticketblock);
    }

  hideElement('spinner');
  showElement('container');
}

function refreshTickets() {
  var ticketTable = document.getElementById('feed');
  var queueTitle = document.getElementById('queuetitle');
  var timeUp = document.getElementsByClassName('timesince');
  var errorDiv = document.getElementsByClassName('error');
  
  if(timeUp.length!=0) {
    timeUp[0].remove();
  }
  if(errorDiv.length != 0) {
    errorDiv[0].remove();
  }
  while(queueTitle.hasChildNodes()) {
    queueTitle.removeChild(queueTitle.firstChild);
  }
  while(ticketTable.hasChildNodes()) {
    ticketTable.removeChild(ticketTable.firstChild);
  }
  toggle('container');
  toggle('spinner');
  console.log('cleared');
  buildPopupAfterResponce = true;
  UpdateFeed();
  UpdateLastRefreshTime();
}
