// Grab our structs from the background page
runtimeStorage = chrome.extension.getBackgroundPage().runtimeStorage;
queueStorage = chrome.extension.getBackgroundPage().queueStorage;


window.onload = function() {
  main();
  setupEvents();
}


// Sets our Event Listners
// Called By: window.onload
function setupEvents() {
  $('#refresh').click(refreshTickets);
  $('#options').click(function() {
    openOptions();
  });
  $("#close").click(function() {
    window.close();
  });
  $('.info').click(function() {
    chrome.tabs.create({url: "options.html"});
  })
}

function main() {
  if (runtimeStorage.length == null || runtimeStorage == 'null') {
    ifdebug(runtimeQueue.length);
    buildPopupAfterResponce = true;
    UpdateIfReady(true);
  }
  else {
    if (runtimeStorage.length === 0) {
      document.getElementById('no-queues').style.display = "block";
      hideElement('loading');
    }
    for (var i=0; i<runtimeStorage.length; i++) {
      if (runtimeStorage[i].error) {
        hideElement('loading');
        hideElement('queueWrapper');
        document.getElementById('connection-error').style.display = "block";
      }
      else {
        buildPopup(runtimeStorage[i]);
      }
    }
  }
}

function buildTicketDiv(ticket) {
  ifdebug("Building Ticket Div");    
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
  ifdebug('Building '+queue.getName());
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
  
  var titletext = document.createElement('div');
      titletext.id = 'queuetitle';
      titletext.className = 'queueFor';
  
  var addtitle = document.createElement('span');
      addtitle.innerText = queue.getName();
  var addnum = document.createElement('span');
      addnum.className = 'ticketCount';
      addnum.innerText = '  (' + queue.tickets.length + ')';
      titletext.appendChild(addtitle);
      titletext.appendChild(addnum);
      titlebar.appendChild(titletext);
      if (queue.getLastRefresh() !== null) {
          var timeSince = $.timeago(queue.getLastRefresh());
          var addTime = document.createElement('div');
              addTime.className = 'timesince timeTopRight';
              addTime.innerText = 'Updated: '+ timeSince;
              titlebar.appendChild(addTime);
      }
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
  
  if (queue.missingUser) {
      var boxxy = document.createElement('div');
          boxxy.className = "error message";
          boxxy.id = "no-user";
      var title = document.createElement('h3');
          title.innerText = "Missing account name :("
      var message = document.createElement('p');
          message.innerText = "Please set it up in options."
        boxxy.appendChild(title);
        boxxy.appendChild(message);
        $(boxxy).click(function() {
          openOptions();
        });
        feed.appendChild(boxxy);
        
        $(arrow).addClass('hidden');
        $(arrow).toggleClass('collapsed');
        $(container).show();
  } else if (queue.tickets.length == 0) {
      var boxxy = document.createElement('div');
          boxxy.className = "success message";
      var title = document.createElement('h3');
          title.innerText = "This Queue is empty."
      var message = document.createElement('p');
          message.innerText = "Your pretty awesome, keep that shit up."
      boxxy.appendChild(title);
      boxxy.appendChild(message);
      feed.appendChild(boxxy);  
      
      $(arrow).addClass('hidden')
      $(arrow).toggleClass('collapsed');
      $(container).hide(); 

  } else {
    for (i=0; i<queue.tickets.length; i++) {
        feed.appendChild(buildTicketDiv(queue.tickets[i]));
    }
    $(arrow).removeClass('hidden');
  }
  
  $(qbox).find(".queueLabelAreaWrapper").click(function  () {
        $(qbox).find(".collapseArrow").toggleClass('collapsed');
        $(qbox).find(".tickets").slideToggle('fast');
  });

  hideElement('loading');
  document.getElementById('no-queues').style.display = "none";
  document.getElementById('connection-error').style.display = "none";
  showElement('queuewrapper');
}

function refreshTickets() {
  toggle('loading');
  toggle('queuewrapper');
  UpdateIfReady(true);
  setTimeout( function() {
    clearPopup();
    for (var i=0; i<runtimeStorage.length; i++) {
      buildPopup(runtimeStorage[i]);
    }
  }, 2300);
}

function clearPopup()  {
  var queues = document.getElementById('content');
  while (queues.children.length > 1) {
    queues.removeChild(queues.lastChild);
  }
}
