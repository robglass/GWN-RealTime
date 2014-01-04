var firstRequest = true;

function startRequest() {
  UpdateIfReady(firstRequest);
  firstRequest = false;
  
  window.setTimeout(startRequest, 5000);
}
 
if (firstRequest) {
  if (localStorage['Global.Setup'] != "true") {
    setDefaultOptions();
  }

  setTheTable();
  // if not set pop options page
  // // no popup page, clicking badge sends to options.
}

startRequest();
