var firstRequest = true;
function startRequest() {
  UpdateIfReady(firstRequest);
  firstRequest = false;
  window.setTimeout(startRequest, 60000);
}

SetInitalOption("ESM.RequestInterval", 1200000);
SetInitalOption("ESM.BackgroundTabs", false);

startRequest();
