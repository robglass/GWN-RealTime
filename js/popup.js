var boxOpen= true;
runtimeStorage = chrome.extension.getBackgroundPage().runtimeStorage;
queueStorage = chrome.extension.getBackgroundPage().queueStorage;


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
}

function main() {
  if (runtimeStorage.length == null || runtimeStorage == 'null') {
    console.log(runtimeQueue.length);
    buildPopupAfterResponce = true;
    UpdateIfReady(true);
  }
  else {
    for (var i=0; i<runtimeStorage.length; i++) {
      console.log(i);
      buildPopup(runtimeStorage[i]);
    }
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
        ticketNum.innerText = ticket.getKey();
      var tickettime = document.createElement('div');
        tickettime.className = 'ticketDetailsTopRight';
      var date = document.createElement('div');
        date.className = 'date';
        date.innerText = ticket.getTime();
      var timeago = document.createElement('span');
        timeago.className = 'timeAgo';
        timeago.innerText =  ' (' + ticket.getTimeAgo() + ')';
      var box2 = document.createElement('div');
        box2.className = 'hbox';
      var ticketTitle = document.createElement('div');
        ticketTitle.className = 'ticketTitle';
        ticketTitle.innerText = ticket.getSummary();
      var notes = document.createElement('div');
        notes.className = 'notes vbox';
        notes.innerText = ticket.getComment();
    
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
           openUrl(ticket.getLink()); 
         });

         return ticketblock;
}

function buildPopup(queue) {
  var content = document.getElementById('content');
  
  var wrapper = document.createElement('div');
      wrapper.className  = "queuewrapper";
      wrapper.style.display = "block";
  content.appendChild(wrapper);

      var qbox = document.createElement('div');
          qbox.className = "queue vbox";
      wrapper.appendChild(qbox);
      var qwapper = document.createElement('div');
          qwapper.className = "queueLabelAreaWrapper hbox wide";
      qbox.appendChild(qwapper);
      var arrow = document.createElement('div');
          arrow.className = "hbox collapseArrow";
      qwapper.appendChild(arrow);
      var titlebar = document.createElement('div');
          titlebar.className = "queueLabelArea hbox wide hasTickets"
      qwapper.appendChild(titlebar);
      var titletext = document.createElement('span');
          titletext.id = 'queuetitle';
          titletext.className = 'queueFor';
      var addtitle = document.createElement('span');
          addtitle.innerText = queue.getName();
      var addnum = document.createElement('span');
          addnum.className = 'ticketCount';
          addnum.innerText = '  (' + queue.tickets.length + ')';
          if (queue.tickets.length == 0) {
            $('.collapseArrow').addClass('hidden')
            $(".collapseArrow").toggleClass('collapsed');
            $(".tickets").slideToggle('fast'); 
          }
          titletext.appendChild(addtitle);
          titletext.appendChild(addnum);
          if (queue.getLastRefresh() !== null) {
            var timeSince = $.timeago(queue.getLastRefresh());
            var addTime = document.createElement('span');
                addTime.className = 'timesince timeTopRight';
                addTime.innerText = 'Updated: '+ timeSince;
            titletext.appendChild(addTime);
              $(titletext).click(function() {
                    openUrl('http://jira.gwn/secure/IssueNavigator.jspa?mode=hide&requestId=14027'); 
                  });
          }
           titlebar.appendChild(titletext);
      var container = document.createElement('div');
          container.id = 'container';
          container.className = 'popup-container tickets';
          container.style.display = 'block';
      qbox.appendChild(container);
      var group = document.createElement('div');
          group.className = "ticketsGroup";
      container.appendChild(group)
      var feed = document.createElement('div');
          feed.id = 'feed';
          feed.className = 'ticketFeed';
      group.appendChild(feed);
      for (i=0; i<queue.tickets.length; i++) {
        feed.appendChild(buildTicketDiv(queue.tickets[i]));
      };
      $(qbox).find(".collapseArrow").click(function  () {
        $(qbox).find(".collapseArrow").toggleClass('collapsed');
        $(qbox).find(".tickets").slideToggle('fast');
      });

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
