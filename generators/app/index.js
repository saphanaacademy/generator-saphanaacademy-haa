"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What project name would you like?",
        validate: (s) => {
          if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
            return true;
          }

          return "Please only use alphanumeric characters for the project name.";
        },
        default: "haa",
      },
      {
        type: "confirm",
        name: "newDir",
        message: "Would you like to create a new directory for this project?",
        default: true,
      },
      {
        type: "input",
        name: "hdiContainerName",
        message: "What is the name of your HDI container?",
        default: "hdi-container",
      },
      {
        type: "input",
        name: "callingHost",
        message: "What is the host of your client application?",
        default: "tenant.region.sapanalytics.cloud",
      },
      {
        type: "confirm",
        name: "authorization",
        message: "Would you like authorization?",
        default: true,
      },
      {
        type: "confirm",
        name: "useNamedUser",
        message: "Will you be configuring SSO (implies shadow users in HANA)?",
        default: false,
      },
    ]).then((answers) => {
      if (answers.newDir) {
        this.destinationRoot(`${answers.projectName}`);
      }
      this.config.set(answers);
    });
  }

  writing() {
    this.sourceRoot(path.join(__dirname, "templates"));
    glob
      .sync("**", {
        cwd: this.sourceRoot(),
        nodir: true,
      })
      .forEach((file) => {
        const sOrigin = this.templatePath(file);
        const sTarget = this.destinationPath(file);
        this.fs.copyTpl(sOrigin, sTarget, this.config.getAll());
      });
  }

  install() {
    /*
    This.installDependencies({
      bower: false,
      npm: true
    });
    */
  }

  end() {
    this.log("");
    this.log("Don't forget to add the SAP HANA Analytics Adapter WAR file (java-xsahaa.war) to the target folder. You can download the SAP HANA Analytics Adapter from https://tools.hana.ondemand.com/#hanatools");
    this.log("");
  }
};
