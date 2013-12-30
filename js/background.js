var firstRequest = true;
function startRequest() {
  UpdateIfReady(firstRequest);
  firstRequest = false;
  
  window.setTimeout(startRequest, 5000);
}
 
if (firstRequest) {
  if (localStorage['OptionsSetup'] != true) {
    setDefaultOptions();
  }
}

getOptions();
startRequest();
