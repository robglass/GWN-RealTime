var firstRequest = true;
function startRequest() {
  UpdateIfReady(firstRequest);
  firstRequest = false;
  window.setTimeout(startRequest, 60000);
}

// 150000 = 2.5 minutes in milliseconds
SetInitalOption("ESM.RequestInterval", 150000);
SetInitalOption("ESM.BackgroundTabs", false);

startRequest();
