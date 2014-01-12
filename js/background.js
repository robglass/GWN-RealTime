var firstRequest = true;
var resetRequest = false;

function startRequest() {
  UpdateIfReady(firstRequest);
  firstRequest = false;
  
  window.setTimeout(startRequest, 5000);
}
 
if (firstRequest) {
  if (localStorage['OptionsSetup'] != 'true') {
    localStorage.clear();
    setDefaultOptions();
  }
  else if (localStorage['Options_Version'] == true) {
    localStorage.clear();
    setDefaultOptions();
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
