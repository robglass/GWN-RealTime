var firstRequest = true;
function startRequest() {
  UpdateIfReady(firstRequest);
  firstRequest = false;
  
  window.setTimeout(startRequest, 5000);
}
 
if (firstRequest) {
  localStorage.clear();
  SetInitalOption("GWNRT.RequestInterval", 60000);
  SetInitalOption("GWNRT.BackgroundTabs", false);
  SetInitalOption("GWNRT.error", null);
}


startRequest();
