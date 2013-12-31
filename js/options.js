window.onload = function() {
  initOptions();
  restoreOptions();
  buildQueueList();
  $('#RefreshRate, #GWNuser, #Queue, #NotificationTimeout').change(function(){
    saveOptions();
  });
}

function initVariables() {
  selectRefreshRate = document.getElementById('RefreshRate');
  selectNotificationTimeout = document.getElementById('NotificationTimeout');
  inputGWNuser = document.getElementById('GWNuser');
  selectQueue = document.getElementById('Queue');
}

function buildQueueList() {
  setupStorage();
  for (i=0; i<queueStorage.length; i++) {
    var option = document.createElement('option');
    option.value = i;
    option.innerText = queueStorage[i].getName();
    selectQueue.appendChild(option);
  }
}

function restoreOptions() {
  initVariables();
  var currentRefresh = localStorage['Global.Refresh'];
  for (var i=0; i<selectRefreshRate.children.length; i++) {
    if (selectRefreshRate[i].value == currentRefresh) {
      selectRefreshRate[i].selected = 'true';
      break;
    }
  }
  var currentNotificationTimeout = localStorage['Global.NotificationTimeout'];
  for (var i=0; i<selectNotificationTimeout.children.length; i++) {
    if (selectNotificationTimeout[i].value == currentNotificationTimeout) {
      selectNotificationTimeout[i].selected = 'true';
      break;
    }
  }
  
  var currentGWNuser = localStorage['Global.GWNuser'];
  inputGWNuser.value = currentGWNuser;
 
  var currentQueue = localStorage['Option.QueueName'];
  for (i=0; i<selectQueue.children.length; i++) {
    if (selectQueue[i].value == currentQueue) {
      selectQueue[i].selected = 'true';
      break;
    }
  }
}

function saveOptions() {
  var newRefesh = selectRefreshRate.children[selectRefreshRate.selectIndex].value;
  setOption('Global.Refresh', newRefresh);

  var newNotificationTimeout = selectNotificationTimeout.children[selectNotificationTimeout.selectIndex].value;
  setOption('Global.NotificationTimeout', newNotificationTimeout);

  var newGWNuser = selectRefreshRate.children[selectRefreshRate.selectIndex].value;
  setOption('Global.Refresh', newRefresh);


}

// Show/hide suboptions at startup)
function initOptions() {
  var a=1;
  $("input[type='checkbox'], input[type='radio']").each(function(index) {
    var $fieldset = $(this).parent("legend").parent("fieldset");
    var $options = $fieldset.children(".subOptions").first();
    
    $fieldset.toggleClass("selected", this.checked);        
    $options.toggle(this.checked);

    // Bind function to show/hide options
    if ($(this).attr("type") == "checkbox") {
      $(this).change(function() {
        $fieldset.toggleClass("selected", this.checked);
        if (this.checked) {
          $options.slideDown();
        } else {
          $options.slideUp();                   
        }
      });
    } else if ($(this).attr("type") == "radio") {
      $(this).change(function() {
        var inputName = $(this).attr("name");
        $("input[name='" + inputName + "']").each(function(index, input) {
          $fieldset = $(this).parent("legend").parent("fieldset");
          $fieldset.toggleClass("selected", this.checked);
          var $subOptions = $fieldset.children(".subOptions").first();
          if (this.checked) {
            $subOptions.slideDown();
          } else {
            $subOptions.slideUp();  
          }
        });
      });
    }
  });
}
