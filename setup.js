/**
 * Script to setup JSInput session.
 */

// SETUP VARIABLES
var initialState = {};
var sessionConfigObjects = {};
var eoxCoreCohort = "eox-core/api/v1/cohort";

// Spreadsheet information. Please, modify this.
var SPREADSHEET_ID = "1a4pXCKJlLjQ14_aMbLcjGG8pmd0QPYQmSGZ49IrE-u4";
var CLIENT_ID =
  "393530767588-e67r7la99tn4bv02bpoqb0jobtiu4kkb.apps.googleusercontent.com";
var API_KEY = "AIzaSyB8QcWoMVhcGwKK10xqV8k3wAY088bgS4g";
var SHEET_NAME = "Hoja 1";
var SPREADSHEET_RANGES = [
  `'${SHEET_NAME}'!A2:A`,
  `'${SHEET_NAME}'!B2:B`,
  `'${SHEET_NAME}'!C2:C`,
  `'${SHEET_NAME}'!D2:D`,
  `'${SHEET_NAME}'!E2:E`,
];

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

/**
 * Function used to setup UI when loading. This includes:
 * - Change submit label to the desired one.
 * - Hide the submit button when session has not started.
 */
function setupUI() {
  // FALTA UN CASO: AUN NO ESTA DISPONIBLE LA GRABACION hacer funcion de hide button
  var labelElements = document.getElementsByClassName("submit-label");
  for (index in labelElements) {
    if (
      labelElements[index].innerText === "Submit" ||
      labelElements[index].innerText === "Enviar"
    )
      labelElements[index].innerText = "Abrir sesión";
  }

  var dateObject = new Date(initialState.sessionStart);
  var currentDate = new Date();

  hideSubmitButton(dateObject > currentDate);
}

/**
 *  Function that given a condition hides the submit button.
 */
function hideSubmitButton(condition) {
  if (condition)
    $(".submit.btn-brand").hide()
}

/**
 *  Function used to initialized state variable.
 */
function getInitialState() {
  // Function used to initialized state variable.
  var jsinput = document.getElementsByClassName("jsinput")[0];
  var initialStateJSON = jsinput.getAttribute("data-initial-state");
  initialState = JSON.parse(initialStateJSON);

  // Convert string to objects
  var sessionStartDate = new Date(initialState.sessionStart);
  var sessionEndDate = new Date(initialState.sessionEnd);
  initialState.sessionStart = sessionStartDate;
  initialState.sessionEnd = sessionEndDate;
}

/**
 * Function that the current context for the JSInput. This context depends on:
 * - Session configuration
 * And sets for the problem: The event that opens URL for Open Session button
 */
async function setProblemContext() {
  const sessionConfig = await getSessionConfig();
  var currentDate = new Date();
  debugger;
  // Depending on datetime show meet or recording URL. Hide if session ended
  var showMeetURL = currentDate > initialState.sessionStart && currentDate < initialState.sessionEnd;
  if (showMeetURL) {
    $(".submit.btn-brand")[0].addEventListener("click", function () {
      window.open(sessionConfig.meetURL, "_blank");
    });
  } else {
    !sessionConfig.recordingURL
      ? hideSubmitButton(true)
      : $(".submit.btn-brand")[0].addEventListener("click", function () {
          window.open(sessionConfig.recordingURL, "_blank");
        });
  }
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

  debugger;
  // 1. Find rows with matching cohort.
  sessionConfigObjects["cohortArray"].forEach((element, index) => {
    if (element[0].toLowerCase() === userCohort.cohort_name.toLowerCase()) {
      filteredPositions.push(index);
    }
  });

  // 2. Find rows with matching courseID.
  filteredPositions = filteredPositions.filter(
    (index) =>
      sessionConfigObjects["courseIDArray"][index][0] === initialState.courseId
  );

  // 3. Find rows with matching session datetime.
  filteredPositions = filteredPositions.filter(
    (index) =>
      new Date(sessionConfigObjects["sessionStartDateArray"][index][0]) -
        initialState.sessionStart ===
      0
  );

  if (filteredPositions.length !== 0)
    return {
      meetURL: sessionConfigObjects.meetURLArray[filteredPositions[0]][0], // HANDLE ERRORS
      recordingURL:
        sessionConfigObjects.recordingURLArray[filteredPositions[0]][0],
    };

  console.warn(
    "Configuration from Google spreadsheet missing for JSInput."
  );
  return {
    meetURL: null,
    recordingURL: null,
  };
}

/**
 *  Function used to get columns used for configuration.
 */
function getSessionFromGoogle() {
  return gapi.client.sheets.spreadsheets.values
    .batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: SPREADSHEET_RANGES,
    })
    .then(
      function (response) {
        var courseIDs = response.result.valueRanges[0];
        var cohorts = response.result.valueRanges[1];
        var meetURLs = response.result.valueRanges[2];
        var recordingURLs = response.result.valueRanges[3];
        var sessionStartDates = response.result.valueRanges[4];

        if (
          typeof courseIDs.values !== "undefined" &&
          courseIDs.values.length > 0
        )
          sessionConfigObjects["courseIDArray"] = courseIDs.values;
        else sessionConfigObjects["courseIDArray"] = [];

        if (typeof cohorts.values !== "undefined" && cohorts.values.length > 0)
          sessionConfigObjects["cohortArray"] = cohorts.values;
        else sessionConfigObjects["cohortArray"] = [];

        if (
          typeof meetURLs.values !== "undefined" &&
          meetURLs.values.length > 0
        )
          sessionConfigObjects["meetURLArray"] = meetURLs.values;
        else sessionConfigObjects["meetURLArray"] = [];

        if (
          typeof recordingURLs.values !== "undefined" &&
          recordingURLs.values.length > 0
        )
          sessionConfigObjects["recordingURLArray"] = recordingURLs.values;
        else sessionConfigObjects["recordingURLArray"] = [];

        if (
          typeof sessionStartDates.values !== "undefined" &&
          sessionStartDates.values.length > 0
        )
          sessionConfigObjects["sessionStartDateArray"] =
            sessionStartDates.values;
        else sessionConfigObjects["sessionStartDateArray"] = [];

        setProblemContext();
      },
      function (response) {
        console.log(response.result.error.message);
      }
    );
}

/**
 *  Prepares the API client for the spreadsheet reading.
 */
function prepareGoogleClient() {
  loadGoogleAPIScript().then(function () {
    handleClientLoad();
  });
}

/**
 *  Function that loads dynamically <script src="https://apis.google.com/js/api.js"></script>
 */
function loadGoogleAPIScript() {
  return $.getScript("https://apis.google.com/js/api.js");
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Function that initialize google client.
 */
function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(function () {
      getSessionFromGoogle();
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

prepareGoogleClient();
getInitialState();
setupUI();
