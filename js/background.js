var firstRequest = true;
var resetRequest = false;

function startRequest() {
  UpdateIfReady(firstRequest);
  firstRequest = false;
  
  window.setTimeout(startRequest, 5000);
}
 

function getVersion() {
  var details = chrome.app.getDetails();
  return details.version;
}
if (firstRequest) {
  var currVersion = getVersion();
  var prevVersion = localStorage['version'];
  if (currVersion != prevVersion) {
    if (typeof prevVersion == 'undefined') {
      // New Install
      setDefaultOptions();
      chrome.tabs.create({url: "options.html"});
    }
    localStorage['version'] = currVersion;
  }
  setTheTable();
}

function restartRuntime() {
  if (resetRequest) {
    ifdebug('****Checking options ****')
    refreshRuntime();
    resetRequest = false;
  }
  window.setTimeout(restartRuntime, 1000);
}

startRequest();
restartRuntime();
