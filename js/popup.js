var boxOpen= true;

window.onload = function() {
  main();
  setupEvents();

  //window.setTimeout(refreshTickets, 30000);
}
function setupEvents() {
  $('#refresh').click(refreshTickets);
  $('#options').click(function() {
    openOptions();
  });
  $("#close").click(function() {
    window.close();
  });
  $(".collapseArrow").click(function() {
      $(".collapseArrow").toggleClass('collapsed');
      $(".tickets").slideToggle('fast');
  });
}

function main() {
  if (localStorage['Queue.Tier2.NumTickets'] == null || localStorage['Queue.Tier2.NumTickets'] == 'null') {
    console.log(localStorage['Queue.Tier2.NumTickets']);
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

function setQueueHeader(title) {
  var headerdiv = document.getElementById('queuetitle');
  var addtitle = document.createElement('span');
      addtitle.innerText = title;
  var addnum = document.createElement('span');
  addnum.className = 'ticketCount';
  addnum.innerText = '  (' + localStorage['Queue.Tier2.NumTickets'] + ')';
  if (localStorage['Queue.Tier2.NumTickets'] == 0) {
    $('.collapseArrow').addClass('hidden')
    $(".collapseArrow").toggleClass('collapsed');
    $(".tickets").slideToggle('fast'); 
  }
  headerdiv.appendChild(addtitle);
  headerdiv.appendChild(addnum);
  if (typeof localStorage['Queue.Tier2.FLastRefresh'] !== 'undefined') {
    var timeSince = $.timeago(localStorage['Queue.Tier2.FLastRefresh']);
    var addTime = document.createElement('span');
      addTime.className = 'timesince timeTopRight';
      addTime.innerText = 'Updated: '+ timeSince;
    headerdiv.appendChild(addTime);
         
    $(headerdiv).click(function() {
           openUrl('http://jira.gwn/secure/IssueNavigator.jspa?mode=hide&requestId=14027'); 
         });
  }
}

function buildTicketDiv(ticket) {
      var ticketblock = document.createElement('div');
        ticketblock.className = "ticket vbox hideScrollbars";
      var box = document.createElement('div');
        box.className = 'hbox wide';
      var img = document.createElement('div');
        img.className = 'imageArea vbox';
      var details = document.createElement('div');
        details.className = 'ticketDetails vbox wide';
      var ticketNum = document.createElement('span');
        ticketNum.className = 'ticketnumber';
        ticketNum.innerText = ticket.key;
      var tickettime = document.createElement('div');
        tickettime.className = 'ticketDetailsTopRight';
      var date = document.createElement('div');
        date.className = 'date';
        date.innerText = ticket.time;
      var timeago = document.createElement('span');
        timeago.className = 'timeAgo';
        timeago.innerText =  ' (' + ticket.timeago + ')';
      var box2 = document.createElement('div');
        box2.className = 'hbox';
      var ticketTitle = document.createElement('div');
        ticketTitle.className = 'ticketTitle';
        ticketTitle.innerText = ticket.summary;
      var notes = document.createElement('div');
        notes.className = 'notes vbox';
        notes.innerText = ticket.comment;
    
      ticketblock.appendChild(box);
       box.appendChild(img);
        img.appendChild(details);
         details.appendChild(ticketNum);
         details.appendChild(tickettime);
          tickettime.appendChild(date);
           date.appendChild(timeago);
         details.appendChild(box2);
          box2.appendChild(ticketTitle);
         details.appendChild(notes);

         $(ticketblock).click(function() {
           openUrl(ticket.link); 
         });

         return ticketblock;
}

function buildPopup(tickets) {
  var feed = document.getElementById('feed');
    setQueueHeader('T2 Queue');  
    for (var i=0; i<tickets.length; i++) {
      feed.appendChild(buildTicketDiv(tickets[i]));
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

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-46802132-2']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
