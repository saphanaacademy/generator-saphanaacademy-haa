"use strict";
const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  initializing() {
    process.chdir(this.destinationRoot());
  }

  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "hdiContainerName",
        message: "What is the name of your HDI container?",
        default: this.config.get("hdiContainerName")
      },
      {
        type: "input",
        name: "clientHostname",
        message: "What is the hostname of the client application that will be accessing HAA? Use * for wildcard.",
        validate: (s) => {
          if (s === "*") {
            return true;
          }
          if (/^[a-zA-Z0-9.-]*$/g.test(s)) {
            return true;
          }
          return "Please only use alphanumeric characters for the client application hostname or use * for wildcard.";
        },
        default: this.config.get("clientHostname")
      },
      {
        type: "confirm",
        name: "personalizeJWT",
        message: "Would you like HAA to propagate the application user to SAP HANA Cloud?",
        default: this.config.get("personalizeJWT")
      },
      {
        type: "confirm",
        name: "useNamedUser",
        message: "Would you like HAA to connect to SAP HANA Cloud via JWT-based SSO (this implies shadow users in SAP HANA Cloud)?",
        default: this.config.get("useNamedUser")
      }
    ]).then((answers) => {
      this.config.set("hdiContainerNameOld", this.config.get("hdiContainerName"));
      this.config.set("hdiContainerName", answers.hdiContainerName);
      this.config.set("clientHostname", answers.clientHostname);
      this.config.set("personalizeJWT", answers.personalizeJWT);
      this.config.set("useNamedUser", answers.useNamedUser);
    });
  }

  writing() {
    let hdiContainerNameOld = this.config.get("hdiContainerNameOld");
    let hdiContainerName = this.config.get("hdiContainerName");
    let clientHostname = this.config.get("clientHostname");
    let personalizeJWT = this.config.get("personalizeJWT");
    let useNamedUser = this.config.get("useNamedUser");
    if (this.config.get('BTPRuntime') === "Kyma") {
      // kyma
      this.fs.copy(
        this.destinationPath("helm/" + this.config.get("projectName") + "-srv/values.yaml"),
        this.destinationPath("helm/" + this.config.get("projectName") + "-srv/values.yaml"),
        {
          process: function (content) {
            var output = "";
            var lines = String(content).split("\n");
            for (var i = 1; i <= lines.length; i++) {
              var line = lines[i - 1];
              var pos = line.search("name: " + hdiContainerNameOld);
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "name: " + hdiContainerName;
              }
              pos = line.search("personalizeJWT:");
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "personalizeJWT: " + personalizeJWT;
              }
              pos = line.search("useNamedUser:");
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "useNamedUser: " + useNamedUser;
              }
              output += line + "\n";
            }
            return output;
          },
        }
      );
      this.fs.copy(
        this.destinationPath("helm/" + this.config.get("projectName") + "-app/values.yaml"),
        this.destinationPath("helm/" + this.config.get("projectName") + "-app/values.yaml"),
        {
          process: function (content) {
            var output = "";
            var lines = String(content).split("\n");
            for (var i = 1; i <= lines.length; i++) {
              var line = lines[i - 1];
              var pos = line.search("clientHostName:");
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "clientHostName: '" + clientHostname + "'";
              }
              output += line + "\n";
            }
            return output;
          },
        }
      );
    } else {
      // cloud foundry
      this.fs.copy(
        this.destinationPath("mta.yaml"),
        this.destinationPath("mta.yaml"),
        {
          process: function (content) {
            var output = "";
            var lines = String(content).split("\n");
            for (var i = 1; i <= lines.length; i++) {
              var line = lines[i - 1];
              var pos = line.search("TARGET_RUNTIME:");
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "TARGET_RUNTIME: tomee7";
              }
              pos = line.search("JBP_CONFIG_RESOURCE_CONFIGURATION:");
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "JBP_CONFIG_RESOURCE_CONFIGURATION: " + `"['tomee7/webapps/ROOT/WEB-INF/resources.xml': {'xsahaa-hdi-container':'` + hdiContainerName + `'}]"`;
              }
              pos = line.search("- name: " + hdiContainerNameOld);
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "- name: " + hdiContainerName;
              }
              pos = line.search("CORS:");
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "CORS: " + `'[{"uriPattern": "^/sap/bc/ina/(.*)$", "allowedOrigin": [{"host":"` + clientHostname + `", "protocol":"https"}], "allowedMethods": ["GET", "POST", "OPTIONS"], "allowedHeaders": ["Origin", "Accept", "X-Requested-With", "Content-Type", "Access-Control-Request-Method", "Access-Control-Request-Headers", "Authorization", "X-Sap-Cid", "X-Csrf-Token"], "exposeHeaders": ["Accept", "Authorization", "X-Requested-With", "X-Sap-Cid", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials", "X-Csrf-Token", "Content-Type"]}]'`;
              }
              pos = line.search("PERSONALIZE_JWT:");
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "PERSONALIZE_JWT: " + personalizeJWT;
              }
              pos = line.search("USE_NAMED_USER:");
              if (pos !== -1) {
                var indent = "";
                for (var j = 0; j < pos; j++) {
                  indent += " ";
                }
                line = indent + "USE_NAMED_USER: " + useNamedUser;
              }
              output += line + "\n";
            }
            return output;
          },
        }
      );
    }
  }

  install() { }

  end() {
    this.log("");
    this.log("Settings have been updated");
    this.log("");
  }
};
