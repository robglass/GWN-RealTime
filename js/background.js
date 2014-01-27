// Global Variables
var firstRequest = true;
var resetRequest = false;


/*   startRequest()
 *   Called by: On background load, refresh every 5 seconds
 *   Calls: UpdateIfReady(core.js), self
 *   
 *   Description: Starts everything, refresh itself.
 */
function startRequest() {
  // Checks Update is ready
  UpdateIfReady(firstRequest);
  // removes firstRequest flag
  firstRequest = false;
  // runs itself every 5 seconds
  window.setTimeout(startRequest, 5000);
}

/*  restartRuntime()
 *  Called by: background.onload
 *  Calls: refreshRuntime(core.js), self
 *
 *  Description: Listener for options changes
 */
function restartRuntime() {
  // Check resetRequest flag
  if (resetRequest) {
    ifdebug('****Checking options ****')
    // update runtime
    refreshRuntime();
    // remove flag
    resetRequest = false;
  }
  // re-run every second
  window.setTimeout(restartRuntime, 1000);
}



/*   MAIN
 *   Calls: setDefaultOptions(core.js), setTheTable(core.js), getVersion
 *
 *   Description: Checks current version at run start. Sets default options if new install
 */
if (firstRequest) {
  // Get current running version
  var currVersion = chrome.app.getDetails();
  // get last used version
  var prevVersion = localStorage['version'];
  // compare them, if diff
  if (currVersion != prevVersion) {
    // if no last used version
    if (typeof prevVersion == 'undefined') {
      // New Install
      setDefaultOptions();
      chrome.tabs.create({url: "options.html"});
    }
    // change the version string
    localStorage['version'] = currVersion;
  }
  _gaq.push(['_setCustomVar',
      1,                   // This custom var is set to slot #1.  Required parameter.
      'Version',           // The top-level name for your online content categories.  Required parameter.
      currVersion,  // Sets the value of "Section" to "Life & Style" for this particular aricle.  Required parameter.
      1                    // Sets the scope to page-level.  Optional parameter.
   ]);  
  // setup everything
  setTheTable();
}

// Start the listners
startRequest();
restartRuntime();
