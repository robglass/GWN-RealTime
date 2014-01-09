var firstRequest = true;

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
  else if (localStorage['Options_Version'] != chrome.runtime.getManifest().version) {
    localStorage.clear();
    setDefaultOptions();
  }
  setTheTable();
}

startRequest();
