var firstRequest = true;
function startRequest() {
  UpdateIfReady(firstRequest);
  firstRequest = false;
  
  window.setTimeout(startRequest, 5000);
}
 
SetInitalOption("ESM.RequestInterval", 60000);
SetInitalOption("ESM.BackgroundTabs", false);


startRequest();
