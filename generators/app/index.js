'use strict';
const Generator = require("yeoman-generator"),
  path = require("path"),
  glob = require("glob");

module.exports = class extends Generator {

  prompting() {
    return this.prompt([{
      type: 'input',
      name: 'projectName',
      message: 'How do you want to name this project?',
      validate: (s) => {
        if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
          return true;
        }
        return 'Please use alphanumeric characters only for the project name.';
      },
      default: 'haa'
    },
    {
      type: 'confirm',
      name: 'newDir',
      message: 'Would you like to create a new directory for the project?',
      default: true
    },
    {
      type: 'input',
      name: 'hdiContainerName',
      message: 'What is the name of your HDI container?',
      default: 'hdi-container',
      validate: (s) => {
        if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
          return true;
        }
        return 'HDI container names contain alphanumeric characters only.';
      },
    },
    {
      type: 'input',
      name: 'callingHost',
      message: 'What is the host of the calling application (to be whitelisted)?',
      default: 'tenant.region.sapanalytics.cloud'
    },
    {
      type: 'confirm',
      name: 'useNamedUser',
      message: 'Will you be using a named HANA user?',
      default: true
    },
    {
      type: 'confirm',
      name: 'multiTenantSupport',
      message: 'Would you like to include multi-tenant application support?',
      default: true
    },
    {
      type: 'input',
      name: 'cfSpace',
      message: 'Which Cloud Foundry space you expect to deploy to?',
      default: 'dev',
      validate: (s) => {
        if (/^[a-zA-Z0-9_-]*$/g.test(s)) {
          return true;
        }
        return 'Cloud Foundry space names contain alphanumeric characters only.';
      },
    }]).then((answers) => {
      if (answers.newDir) {
        this.destinationRoot(`${answers.projectName}`);
      }
      if (answers.multiTenantSupport) {
        answers.tenantMode = 'shared';
      } else {
        answers.tenantMode = 'dedicated';
      }
      this.config.set(answers);
    });
  }

  writing() {
    this.sourceRoot(path.join(__dirname, 'templates'));
    glob.sync('**', {
      cwd: this.sourceRoot(),
      nodir: true
    }).forEach((file) => {
      const sOrigin = this.templatePath(file);
      const sTarget = this.destinationPath(file);
      this.fs.copyTpl(sOrigin, sTarget, this.config.getAll());
    });
  }

  install() {
    this.installDependencies({
      bower: false,
      npm: true
    });;
  }

  end() {
    this.log('');
    this.log('You can download the SAP HANA Analytics Adapter WAR file from https://tools.hana.ondemand.com/#hanatools');
    this.log('');
  }

};
