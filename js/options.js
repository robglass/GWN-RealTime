window.onload = function() {
  queueStorage = chrome.extension.getBackgroundPage().queueStorage;
  //initOptions();
  buildQueueList();
  restoreOptions();
  $('#RefreshRate, #GWNuser, #Queue, #NotificationTimeout').change(function(){
    saveOptions();
  });
}

function initVariables() {
  selectRefreshRate = document.getElementById('RefreshRate');
  selectNotificationTimeout = document.getElementById('NotificationTimeout');
  inputGWNUser = document.getElementById('GWNuser');
  selectQueue = document.getElementById('Queue');
}

function buildQueueList() {
  initVariables();
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
  
  if (localStorage['Global.GWNUser'] != undefined) {
    var currentGWNuser = localStorage['Global.GWNUser'];
    inputGWNUser.value = currentGWNuser;
  }
 
  if (localStorage['Global.Queue'] != undefined) {
    var currentQueue = localStorage['Global.Queue'];
    selectQueue[currentQueue].selected = 'true';
  };


}

function saveOptions() {
  var newRefresh = selectRefreshRate.children[selectRefreshRate.selectedIndex].value;
  SetOption('Global.Refresh', newRefresh);

  var newNotificationTimeout = selectNotificationTimeout.children[selectNotificationTimeout.selectedIndex].value;
  SetOption('Global.NotificationTimeout', newNotificationTimeout);

  var newGWNUser = inputGWNUser.value;
  SetOption('Global.GWNUser', newGWNUser);
  SetOption('Global.GWNUserJQL', 'assignee = '+ newGWNUser +' and status not in (Closed, Done)');

  var newQueue = selectQueue.value;
  SetOption('Global.Queue', newQueue);
}

// Show/hide suboptions at startup)
//function initOptions() {
//  var a=1;
//  $("input[type='checkbox'], input[type='radio']").each(function(index) {
//    var $fieldset = $(this).parent("legend").parent("fieldset");
//    var $options = $fieldset.children(".subOptions").first();
//    
//    $fieldset.toggleClass("selected", this.checked);        
//    $options.toggle(this.checked);
//
//    // Bind function to show/hide options
//    if ($(this).attr("type") == "checkbox") {
//      $(this).change(function() {
//        $fieldset.toggleClass("selected", this.checked);
//        if (this.checked) {
//          $options.slideDown();
//        } else {
//          $options.slideUp();                   
//        }
//      });
//    } else if ($(this).attr("type") == "radio") {
//      $(this).change(function() {
//        var inputName = $(this).attr("name");
//        $("input[name='" + inputName + "']").each(function(index, input) {
//          $fieldset = $(this).parent("legend").parent("fieldset");
//          $fieldset.toggleClass("selected", this.checked);
//          var $subOptions = $fieldset.children(".subOptions").first();
//          if (this.checked) {
//            $subOptions.slideDown();
//          } else {
//            $subOptions.slideUp();  
//          }
//        });
//      });
//    }
//  });
//}

