runtimeStorage = chrome.extension.getBackgroundPage().runtimeStorage;
queueStorage =  chrome.extension.getBackgroundPage().queueStorage;
savedOptions = JSON.parse(localStorage['Global.Queue']);

window.onload = function() {
  buildQueueList();
  restoreOptions();
  setupEventListeners();
}
function setupEventListeners() {
  // Flips Queuelist and Add divs when the Add button is pressed
  $('.add').click(function() { 
    $('.main-content').slideToggle('fast');
    $('.queue-add').slideToggle('fast');
  });
  
  $('#clear-add').click(function() {
    $('.main-content').slideToggle('fast');
    $('.queue-add').slideToggle('fast');
  })
  $('#useBadge').change(function() {
    if (this.value == 'none') {
      setBadgeText(0);
      for (var i=0;i<savedOptions.length;i++) {
          savedOptions[i].useBadgeCounter = false;
      }
    }
    else {
      for (var i=0;i<savedOptions.length;i++) {
        if (this.value == savedOptions[i].queueIndex) {
           savedOptions[i].useBadgeCounter = true;
          setBadgeText(runtimeStorage[i].tickets.length);
        }
        else {
          savedOptions[i].useBadgeCounter = false;
        }
      }
    } 
      saveOptions();
      chrome.extension.getBackgroundPage().resetRequest = true;
  })


  // Saves new queue
  $('#save-add').click(function() {
    queue = new Object; 
    queue.queueIndex = parseInt(document.getElementById('Queue').value);
    if (queue.queueIndex == 0) {
        localStorage['Global.GWNUser'] = document.getElementById('GWNuser').value;
    }
    queue.notify = document.getElementById('notify').checked;
    queue.updateInterval = parseInt(document.getElementById('RefreshRate').value);
    queue.useBadgeCounter = false;
    savedOptions.push(queue);
    //runtimeStorage.push(new runningQueue(queue.queueIndex, queue.updateInterval, queue.notify, queue.useBadgeCounter)); 
    saveOptions();
    chrome.extension.getBackgroundPage().resetRequest = true;
    resetQueueList();
    $('.main-content').slideToggle('fast');
    $('.queue-add').slideToggle('fast');
  })
  
  // Saves notification Flag
  $('#GWNUser').change(function() {
    localStorage['Global.GWNUser'] = this.value;  
    for (var i=0; i<runtimeStorage.length;i++){
      if (runtimeStorage[i].index == 0) {
        console.log(runtimeStorage[i].getName());
        runtimeStorage[i].UpdatedAt = 0;
        break;
      }   
    }  
  })
  $('.notify').change(function() {
      ifdebug("Changing "+ queueStorage[this.id].getName()+ " to " + this.checked);
      for (var i=0; i<savedOptions.length;i++){
           if (this.id == savedOptions[i].queueIndex) {
              queue = savedOptions[i];
              break;
          }   
      }  
      if (this.checked) {
        queue.notify = true;
      }
      else {
          queue.notify = false;
      }
      saveOptions();
      chrome.extension.getBackgroundPage().resetRequest = true;
  });
  
  $('.updateInterval').change(function() {
    console.log(this);
    for (var i=0; i<savedOptions.length;i++){
      if (this.id == savedOptions[i].queueIndex) {
        queue = savedOptions[i];
      }   
    }  
    console.log('Saving '+queueStorage[queue.queueIndex].getName());
    queue.updateInterval = this.value;
    saveOptions();
    chrome.extension.getBackgroundPage().resetRequest = true;
  });

  // Flips GWNuser box when Personal is selected
  $('#Queue').change(function() {
    if (this.value == '0') {
      //document.getElementById('GWNuser').style.display = 'inline';
      $('#GWNuser').slideDown('fast');
    }
    else {
      $('#GWNuser').slideUp('fast');
    }
  });
}


function buildQueueList() {
  var i=0;  
  for (x=0;x<savedOptions.length;x++){
    if (savedOptions[x].queueIndex == '0') {
      i = 1;
      document.getElementById('GWNuser').style.display = 'none';
      break;
    } 
  }
  for (i; i<queueStorage.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.innerText = queueStorage[i].getName();
    document.getElementById('Queue').appendChild(option);
  }
}
function resetQueueList() {
  list = $('.queue-item');
  for (var i=0;i<list.length; i++) {
    console.log('Removing queue');
    list[i].remove();
  }
  restoreOptions();
}

function restoreOptions() {
  for (var i=0;i<savedOptions.length;i++) {
    var option = document.createElement('option');
    option.value = savedOptions[i].queueIndex;
    option.innerText = queueStorage[savedOptions[i].queueIndex].getName();
    document.getElementById('useBadge').appendChild(option);
    if (savedOptions[i].useBadgeCounter) {
      document.getElementById('useBadge').value = option.value; 
    }
    var list = document.getElementsByClassName('placeholder')[1];
    list.appendChild(queueList(savedOptions[i]));
  }
}

function queueList(queue) {
  var queueItem = document.createElement('div');
      queueItem.className = 'queue-item';
  var queueC= document.createElement('div');
      queueC.className = 'queue';
  var cover= document.createElement('div');
      cover.className = 'cover';
  var queueMove= document.createElement('div');
      queueMove.className = 'queue-move';
  var dragIcon = document.createElement('span');
      dragIcon.className = 'icon draggable';
  var queueTitle= document.createElement('div');
      queueTitle.className = 'queue-title';
  var queueTitleText = document.createElement('span');
      queueTitleText.innerText = queueStorage[queue.queueIndex].getName();
  var queueRemove = document.createElement('div');
      queueRemove.className = 'queue-remove';
  var crossIcon = document.createElement('span');
      crossIcon.className = 'icon cross';

  $(queueRemove).click(function() {
      $(queueItem).slideToggle('fast');
      for (var i=0;i<savedOptions.length;i++){
        if (queue.queueIndex == savedOptions[i].queueIndex) {
            if (runtimeStorage[i].useIconText) {
              //set badge counter to null
              chrome.browserAction.setBadgeText({text: ''});
              //set Selection dropdown to none;
              document.getElementById('useBadge').value = 'none'; 
            }
            //remove from Selection dropdown
            for (var j=0;j<document.getElementById('useBadge').children.length;j++) {
              if (queue.queueIndex == document.getElementById('useBadge').children[j].value) {
                document.getElementById('useBadge').children[j].remove();
                break;
              }
            }
            console.log('Removing '+ i);
            savedOptions.splice(i,1);
            runtimeStorage.splice(i,1);
            break;
        }
      }
      saveOptions();
      selectNode = document.getElementById('Queue')
      while (selectNode.hasChildNodes()) {
        selectNode.removeChild(selectNode.firstChild);
      }
      buildQueueList();
  });
  var queueOptions = document.createElement('div');
      queueOptions.className = 'queueOptions';
  var divWrapper = document.createElement('div')
  var opt1text = document.createElement('span');
      opt1text.innerText = 'Enable Notifications';
  var notify = document.createElement('input');
      notify.type = 'checkbox';
      notify.className = 'notify';
      notify.id =  queue.queueIndex;
      if (queue.notify) {
        ifdebug("checking notify for "+ queueStorage[queue.queueIndex].getName());
        notify.checked = true;
      };
  var divWrapper2 = document.createElement('div');
  var opt2text = document.createElement('span');
      opt2text.innerText = 'Refresh rate:';
  var refreshRate = document.createElement('select');
      refreshRate.type = 'text';
      refreshRate.className = 'updateInterval';
      refreshRate.id = queue.queueIndex;
  var option1 = document.createElement('option')
      option1.value = '60000';
      option1.innerText = '1 minute';
  var option2 = document.createElement('option')
      option2.value = '300000';
      option2.innerText = '5 minutes ';
  var option3 = document.createElement('option')
      option3.value = '600000';
      option3.innerText = '10 minutes';
  var option4 = document.createElement('option')
      option4.value = '900000';
      option4.innerText = '15 minutes';
  var option5 = document.createElement('option')
      option5.value = '1800000';
      option5.innerText = '30 minutes';
  var option6 = document.createElement('option')
      option6.value = '0';
      option6.innerText = 'Never';
  var divWrapper3 = document.createElement('div');
  var changeButton = document.createElement('button');
      changeButton.innerText = 'Change';
  
  queueItem.appendChild(queueC);
    queueC.appendChild(cover);
    queueC.appendChild(queueMove);
      queueMove.appendChild(dragIcon);
    queueC.appendChild(queueTitle);
      queueTitle.appendChild(queueTitleText);
    queueC.appendChild(queueRemove);
      queueRemove.appendChild(crossIcon);
  queueItem.appendChild(queueOptions);
    if (queue.queueIndex === 0) {
      var divW = document.createElement('div');
      var nameBox = document.createElement('input');
          nameBox.type = "text";
          nameBox.id = 'GWNUser';
          nameBox.value = localStorage['Global.GWNUser'];
      queueOptions.appendChild(divW);
        divW.appendChild(nameBox);
    };
    queueOptions.appendChild(divWrapper);
    queueOptions.appendChild(divWrapper2);
    queueOptions.appendChild(divWrapper3);
      divWrapper.appendChild(opt1text);
      divWrapper.appendChild(notify)
      divWrapper2.appendChild(opt2text);
      divWrapper2.appendChild(refreshRate);
        refreshRate.appendChild(option1);
        refreshRate.appendChild(option2);
        refreshRate.appendChild(option3);
        refreshRate.appendChild(option4);
        refreshRate.appendChild(option5);
        refreshRate.appendChild(option6); 

  for (var i=0;i<refreshRate.children.length;i++){
    if (queue.updateInterval == refreshRate.children[i].value) {
      refreshRate.children[i].selected = true;
    break;
    }
  }
  
  // Event Listeners
    // Slide down queueOptions  
  $(queueTitle).click(function() {
      $(queueOptions).slideToggle('fast');
  });
    // Verifies only one queue is check
  
  return queueItem;
}


function saveOptions(restart) {
  localStorage['Global.Queue'] = JSON.stringify(savedOptions);
  if (restart) {
    chrome.extension.getBackgroundPage().resetRequest = true;
  }
}

