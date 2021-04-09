/**
 * Script to setup JSInput session.
 */

// SETUP VARIABLES
var initialState;
var sessionConfigObjects = {};
var eoxCoreCohort = "eox-core/api/v1/cohort";

// Spreadsheet information. Please, modify this.
var SPREADSHEET_ID = "1a4pXCKJlLjQ14_aMbLcjGG8pmd0QPYQmSGZ49IrE-u4";
var CLIENT_ID =
  "393530767588-e67r7la99tn4bv02bpoqb0jobtiu4kkb.apps.googleusercontent.com";
var API_KEY = "AIzaSyB8QcWoMVhcGwKK10xqV8k3wAY088bgS4g";
var SHEET_NAME = "Hoja 1";
var SPREADSHEET_RANGES = [`'${SHEET_NAME}'!A2:A`, `'${SHEET_NAME}'!B2:B`, `'${SHEET_NAME}'!C2:C`, `'${SHEET_NAME}'!D2:D`, `'${SHEET_NAME}'!E2:E`];

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";


setupJSInput();

async function setupJSInput() {
  // Calls used to setup jsinput
  await prepareGoogleClient();
  getInitialState();
  setupUI();
  setProblemContext();
}
/**
 * Function used to setup UI when loading. This includes:
 * - Change submit label to the desired one.
 * - Hide the submit button when session has not started.
 */
function setupUI() {
  var labelElements = document.getElementsByClassName("submit-label");
  for (index in labelElements) {
    if (
      labelElements[index].innerText === "Submit" ||
      labelElements[index].innerText === "Enviar"
    )
      labelElements[index].innerText = "Open Session";
  }

  var dateObject = new Date(initialState.SessionDatetime);
  var currentDate = new Date();
  Math.sign(dateObject - currentDate) === 1
    ? (document.getElementsByClassName("submit btn-brand")[0].hidden = true)
    : null;
}

/**
 *  Function used to initialized state variable.
 */
function getInitialState() {
  // Function used to initialized state variable.
  var jsinput = document.getElementsByClassName("jsinput")[0];
  var initialStateJSON = jsinput.getAttribute("data-initial-state");
  initialState = JSON.parse(initialStateJSON);
}

/**
 * Function that the current context for the JSInput. This context depends on:
 * - Session configuration
 * And sets for the problem: The event that opens URL for Open Session button
 */
function setProblemContext() {
  const sessionConfig = getSessionConfig();
}

// Helper functions.

/**
 *  Function used to get meet session configuration from SPREADSHEET_ID.
 */
async function getSessionConfig() {
  var userCohort = await getUserCohort();
  var filteredPositions = [];

  if (!userCohort) return {};

  // We must search for the correct URL given the cohort, courseID and session datetime,

  // 1. Find rows with matching cohort.
  sessionConfigObjects["cohortsArray"].forEach(element, index => {
    debugger;
    if(element === userCohort.cohort_name){
      filteredPositions.push(index);
    }
  });

  // 2. Find rows with matching courseID.
/*   sessionConfigObjects["courseIDsArray"].forEach(courseID, courseIdIndex => {
    if(courseID === initialState.courseId){
      filteredPositions.filter(index => {
        if (index === courseIdIndex) return true;
        return false;
      });
    }
  });

  // 3. Find rows with matching session datetime.
  sessionConfigObjects["sessionStartsArray"].forEach(datetime, DatetimeIndex => {
    var sessionDatetime = new Date(datetime);
    if(sessionDatetime === initialState.sessionStarts){
      filteredPositions.filter(index => {
        if (index === DatetimeIndex) return true;
        return false;
      });
    }
  }); */
  var result = {
    meetURL: "",
    recordingURL: "",
  };
  return result;
}

/**
  *  Function used to get columns used for configuration.
  */
function getColsFromSpreadsheet() {
  debugger;
  return gapi.client.sheets.spreadsheets.values
    .batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: SPREADSHEET_RANGES,
    })
    .then(
      function (response) {
        debugger;
        sessionConfigObjects["courseIDArray"] = response.result.valueRanges[0].values;
        sessionConfigObjects["cohortsArray"] = response.result.valueRanges[1].values;
        sessionConfigObjects["meetURLsArray"] = response.result.valueRanges[2].values;
        sessionConfigObjects["recordingURLsArray"] = response.result.valueRanges[3].values;
        sessionConfigObjects["sessionStartsArray"] = response.result.valueRanges[4].values;
      },
      function (response) {
        console.log(response.result.error.message);
      }
    );
}

/**
  *  Prepares the API client for the spreadsheet reading.
  */
 async function prepareGoogleClient() {
  await loadGoogleAPIScript();
  await handleClientLoad();
 }

/**
  *  Function that loads dynamically <script src="https://apis.google.com/js/api.js"></script>
  */
function loadGoogleAPIScript() {
  debugger;
  return $.getScript("https://apis.google.com/js/api.js");
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
async function handleClientLoad() {
  debugger;
  await new Promise((res, rej) => {
    gapi.load("client:auth2", initClient);
  });
}

/**
 *  Function that initialize google client.
 */
async function initClient() {
    debugger;
    await gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function() {
      getColsFromSpreadsheet();
    });
}

/**
 *  Function used to get the current user cohort.
 */
function getUserCohort() {
  var data = document.getElementById("user-metadata");

  if (!data) return null;

  var username = JSON.parse(data.innerHTML).username;
  var courseIdSafe = encodeURIComponent(initialState.courseId);
  return fetch(
    `${window.location.origin}/${eoxCoreCohort}/?course_id=${courseIdSafe}&amp;username=${username}`
  )
    .then(function (data) {
      return data.json();
    })
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      console.warn(error);
    });
}
