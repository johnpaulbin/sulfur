var sulfur = {
  "run" : function () {
    if (!sulfur.ready) {
      console.error("Sulfur not ready!");
      return;
    }
    //Reset Log and Variables
    sulfur.lineData = [];
    sulfur.vars = {}; //Functions are also supposed to put outputs in vars, eg. Prompts the user for name, and the answer goes in sulfur.sfrvars.answer. You can use the vars module for more features.
    //Loop through lines
    for (sulfur.lineNumber = 1; sulfur.lineNumber < sulfur.code.length; sulfur.lineNumber++) {
      sulfur.vars.thisLine = sulfur.lineNumber;
      var line = sulfur.code[sulfur.lineNumber];
      //Add to LineData log
      sulfur.lineData[sulfur.lineNumber] = [];
      //Encode things between quotes
      line = sulfur.encodeQuotes(line);
      sulfur.lineLog("Line " + (sulfur.lineNumber + 1) + ": " + line);
      if (line === "") {
        //Empty Line
        sulfur.lineLog("Empty Line, Ignoring");
      } else if (line.substring(0, 2) === "--") {
        sulfur.lineLog("Comment, Ignoring");
      } else {
        //Is a command
        var commandString = line.split(":")[0];
        var paramString = line.split(":")[1];
        //Parse Command
        var command = commandString.split(" ");
        //If no params specified, blank string
        paramString = paramString ? paramString : "";
        //Variables
        paramString = sulfur.replaceVars(paramString);
        //Parse Params
        var params = paramString.split(" ");
        //Log Command and Params
        sulfur.lineLog(command);
        sulfur.lineLog(params);
        //Get Command
        var commandNode = sulfur.commands;
        var cmdexists = true;
        for (var commandNodes = 0; (commandNodes < command.length && cmdexists); commandNodes++) {
          commandNode = commandNode[command[commandNodes]];
          if (!commandNode) cmdexists = false;
        }
        if (!cmdexists) {
          sulfur.lineLog("Command does not exist, ending script");
          return false;
        }
        commandNode(params);
      }
    }
    //End Successfully
    return true;
  },
  "encodeQuotes" : function (s) {
    //Thanks to ic3b3rg on Stack Overflow for this RegEx: https://stackoverflow.com/a/54027889/10124491
    // """ seems to work. I'm baffled why. I need to learn RegEx
    return s.replace(/"(.+?)"/g, (s, t) => encodeURIComponent(t));
  },
  "replaceVars" : function (s) {
    //Based on sulfur.encodeQuotes
    return s.replace(/\*(.+?)\*/g, (s, t) => encodeURIComponent(sulfur.vars[t]));
  },
  "lineLog" : function (message) {
    sulfur.lineData[sulfur.lineNumber].push(message);
  },
  "commands" : {
  },
  "loadModule" : function (moduleName) {
    import("https://rawcdn.githack.com/johnpaulbin/sulfur-modules/f19a79fb8f13fa9f6fc7503dfa58db12810687f7/modules/" + moduleName + ".mjs").then(module => {
      sulfur.commands[moduleName] = module.default;
    });
  },
  "setupProject" : function (sulfurCode) {
    sulfur.ready = true;
    sulfur.code = sulfurCode.split("\n");
    sulfur.metadata = JSON.parse(sulfur.code[0]);
    //Load Modules
    for (var moduleNumber = 0; moduleNumber < sulfur.metadata.requires.length; moduleNumber++) {
      sulfur.loadModule(sulfur.metadata.requires[moduleNumber]);
    }
  },
  "logic" : {
    "condition" : function (conditionStr) {
      if (conditionStr === "true" || conditionStr === "false") {
        //If true or false
        return JSON.parse(conditionStr);
      } else if (conditionStr.split("=").length === 2) {
        //If equal comparison
        var values = conditionStr.split("=");
        return values[0] === values[1];
      } else if (conditionStr === "undefined") {
        //If var does not exist (undefined)
        return false;
      } else {
        // Nothing = false, anything = true
        return conditionStr != "";
      }
    }
  },
  "num" : function (int) {
    if (isNaN(int)) return false;
    return Number(int);
  }
}
