/* globals Channel */

(function () {
  "use strict";

  var initialState = {
    courseId: "",
    sessionStart: "",
    sessionEnd: "",
    graded: "false",
  };
  var channel;
  var infoElement = document.querySelector(".text-info");

  function setProblemContext() {
    // Function that the current context for the JSInput. This context depends on:
    // * Session datetime (datetime when the session starts)
    // The context includes: message to show
    var sessionStart = new Date(initialState.sessionStart);
    var sessionEnd = new Date(initialState.sessionEnd);
    var currentDate = new Date();

    if (sessionStart > currentDate) {
      // the session has not started
      infoElement.innerHTML = `La sesión comenzará el ${sessionStart.getDate()}/${
        sessionStart.getMonth() + 1
      }
       a las ${sessionStart.toLocaleTimeString()}.`;
    } else if (currentDate < sessionEnd) {
      infoElement.innerHTML =
        "La sesión en vivo ya está disponible haz click en el botón para comenzar.";
    } else {
      infoElement.innerHTML =
        "Esta sesión ya terminó, presiona `Abrir sesión` para visualizar la grabación. Si la opción no está disponible, por favor, vuelve más tarde.";
    }
  }

  function getGrade() {
    // The following return value may or may not be used to grade server-side.
    // If getState and setState are used, then the Python grader also gets access
    // to the return value of getState and can choose it instead to grade.
    // window.open(pathToResource, "_blank");
    return JSON.stringify(initialState);
  }

  function getState() {
    // Returns the current state (which can be used for grading).
    return JSON.stringify(initialState);
  }

  // This function will be called with 1 argument when JSChannel is not used,
  // 2 otherwise. In the latter case, the first argument is a transaction
  // object that will not be used here
  // (see http://mozilla.github.io/jschannel/docs/)
  function setState() {
    var stateString = arguments.length === 1 ? arguments[0] : arguments[1];
    initialState = JSON.parse(stateString);
    setProblemContext();
  }

  // Establish a channel only if this application is embedded in an iframe.
  // This will let the parent window communicate with this application using
  // RPC and bypass SOP restrictions.
  if (window.parent !== window) {
    channel = Channel.build({
      window: window.parent,
      origin: "*",
      scope: "JSInput",
    });

    channel.bind("getGrade", getGrade);
    channel.bind("getState", getState);
    channel.bind("setState", setState);
  }

  return {
    getState: getState,
    setState: setState,
    getGrade: getGrade,
  };
})();
