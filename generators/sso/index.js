"use strict";
const Generator = require("yeoman-generator");

module.exports = class extends Generator {
  prompting() {
    return this.prompt([
      {
        type: "confirm",
        name: "useNamedUser",
        message: "Will you be configuring SSO (implies shadow users in HANA)?",
        default: this.config.get("useNamedUser"),
      },
    ]).then((answers) => {
      this.config.set("useNamedUser", answers.useNamedUser);
    });
  }

  writing() {
    let useNamedUser = this.config.get("useNamedUser");
    this.fs.copy(
      this.destinationPath("mta.yaml"),
      this.destinationPath("mta.yaml"),
      {
        process: function (content) {
          var output = "";
          var lines = String(content).split("\n");
          for (var i = 1; i <= lines.length; i++) {
            var line = lines[i - 1];
            var pos = line.search("USE_NAMED_USER:");
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

  install() {}

  end() {
    this.log("");
    this.log("SSO settings have been updated");
    this.log("");
  }
};
