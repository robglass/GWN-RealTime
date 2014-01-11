runtimeStorage = chrome.extension.getBackgroundPage().runtimeStorage;
queueStorage =  chrome.extension.getBackgroundPage().queueStorage;
savedOptions = JSON.parse(localStorage['Global.Queue']);

window.onload = function() {
  //initOptions();
  buildQueueList();
  restoreOptions();
  $('#RefreshRate, #GWNuser, #Queue, #NotificationTimeout').change(function(){
    saveOptions();
  });
}

function buildQueueList() {
  for (i=1; i<queueStorage.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.innerText = queueStorage[i].getName();
    //selectQueue.appendChild(option);
  }
}

function restoreOptions() {
  for (var i=0;i<savedOptions.length;i++) {
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
            console.log('Removing '+ i);
            savedOptions.splice(i,1);
            break;
        }
      }
      saveOptions();
  });
  var queueOptions = document.createElement('div');
      queueOptions.className = 'queueOptions';
  var divWrapper = document.createElement('div')
  var opt1text = document.createElement('span');
      opt1text.innerText = 'Enable Notifications';
  var notify = document.createElement('input');
      notify.type = 'checkbox';
      if (queue.notify) {
      notify.checked = true;
      };
  var divWrapper2 = document.createElement('div');
  var opt2text = document.createElement('span');
      opt2text.innerText = 'Refresh rate:';
  var refreshRate = document.createElement('select');
      refreshRate.type = 'text';
      refreshRate.id = 'RefreshRate';
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


function saveOptions() {
  localStorage['Global.Queue'] = JSON.stringify(savedOptions);
  chrome.extensions.getBackgroundPage().setTheTable();
}

