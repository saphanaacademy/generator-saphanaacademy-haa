"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const glob = require("glob");
const types = require("@sap-devx/yeoman-ui-types");

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.setPromptsCallback = (fn) => {
      if (this.prompts) {
        this.prompts.setCallback(fn);
      }
    };
    const virtualPrompts = [
      {
        name: "Project Attributes",
        description: "Configure the main project attributes."
      },
      {
        name: "Runtime Selection",
        description: "Choose and configure your runtime."
      },
      {
        name: "Additional Attributes",
        description: "Configure additional attributes."
      }
    ];
    this.prompts = new types.Prompts(virtualPrompts);
  }

  initializing() {
    process.chdir(this.destinationRoot());
  }

  async prompting() {
    // defaults
    const answers = {};
    answers.projectName = "app";
    answers.newDir = true;
    answers.BTPRuntime = "CF";
    answers.namespace = "default";
    answers.dockerID = "";
    answers.dockerRepositoryName = "";
    answers.dockerRepositoryVisibility = "public";
    answers.dockerRegistrySecretName = "docker-registry-config";
    answers.dockerServerURL = "https://index.docker.io/v1/";
    answers.dockerEmailAddress = "";
    answers.dockerPassword = "";
    answers.kubeconfig = "";
    answers.buildCmd = "pack";
    answers.clusterDomain = "0000000.kyma.ondemand.com";
    answers.gateway = "kyma-gateway.kyma-system.svc.cluster.local";
    answers.hdiContainerName = "hdi-container";
    answers.authorization = true;
    answers.clientHostname = "*";
    answers.personalizeJWT = false;
    answers.externalSessionManagement = false;
    answers.useNamedUser = false;
    // prompts
    const answersProject = await this.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What project name would you like?",
        validate: (s) => {
          if (/^[a-zA-Z][a-zA-Z0-9]*$/g.test(s)) {
            return true;
          }
          return "Please start with a letter and only use alphanumeric characters for the project name.";
        },
        default: answers.projectName
      },
      {
        type: "confirm",
        name: "newDir",
        message: "Would you like to create a new directory for this project?",
        default: answers.newDir
      }
    ]);
    const answersRuntime = await this.prompt([
      {
        type: "list",
        name: "BTPRuntime",
        message: "Which runtime will you be deploying the project to?",
        choices: [{ name: "SAP BTP, Cloud Foundry runtime", value: "CF" }/*, { name: "SAP BTP, Kyma runtime", value: "Kyma" }*/],
        store: true,
        default: answers.BTPRuntime
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "namespace",
        message: "What SAP BTP, Kyma runtime namespace will you be deploying to?",
        validate: (s) => {
          if (/^[a-z0-9-]*$/g.test(s) && s.length > 0 && s.substring(0, 1) !== '-' && s.substring(s.length - 1) !== '-') {
            return true;
          }
          return "Your SAP BTP, Kyma runtime namespace can only contain lowercase alphanumeric characters or -.";
        },
        store: true,
        default: answers.namespace
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "dockerID",
        message: "What is your Docker ID?",
        validate: (s) => {
          if (/^[a-z0-9]*$/g.test(s) && s.length >= 4 && s.length <= 30) {
            return true;
          }
          return "Your Docker ID must be between 4 and 30 characters long and can only contain numbers and lowercase letters.";
        },
        store: true,
        default: answers.dockerID
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "dockerRepositoryName",
        message: "What is your Docker repository name? Leave blank to create a separate repository for each microservice.",
        validate: (s) => {
          if ((/^[a-z0-9-_]*$/g.test(s) && s.length >= 2 && s.length <= 225) || s === "") {
            return true;
          }
          return "Your Docker repository name must be between 2 and 255 characters long and can only contain numbers, lowercase letters, hyphens (-), and underscores (_).";
        },
        default: answers.dockerRepositoryName
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "dockerRepositoryVisibility",
        message: "What is your Docker repository visibility?",
        choices: [{ name: "Public (Appears in Docker Hub search results)", value: "public" }, { name: "Private (Only visible to you)", value: "private" }],
        store: true,
        default: answers.dockerRepositoryVisibility
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerRegistrySecretName",
        message: "What is the name of your Docker Registry Secret? It will be created in the namespace if you specify your Docker Email Address and Docker Personal Access Token or Password.",
        store: true,
        default: answers.dockerRegistrySecretName
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerServerURL",
        message: "What is your Docker Server URL?",
        store: true,
        default: answers.dockerServerURL
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "input",
        name: "dockerEmailAddress",
        message: "What is your Docker Email Address? Leave blank if your Docker Registry Secret already exists in the namespace.",
        default: answers.dockerEmailAddress
      },
      {
        when: response => response.BTPRuntime === "Kyma" && response.dockerRepositoryVisibility === "private",
        type: "password",
        name: "dockerPassword",
        message: "What is your Docker Personal Access Token or Password? Leave blank if your Docker Registry Secret already exists in the namespace.",
        mask: "*",
        default: answers.dockerPassword
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "input",
        name: "kubeconfig",
        message: "What is the path of your Kubeconfig file? Leave blank to use the KUBECONFIG environment variable instead.",
        default: answers.kubeconfig
      },
      {
        when: response => response.BTPRuntime === "Kyma",
        type: "list",
        name: "buildCmd",
        message: "How would you like to build container images?",
        choices: [{ name: "Paketo (Cloud Native Buildpacks)", value: "pack" }, { name: "Docker", value: "docker" }, { name: "Podman", value: "podman" }],
        store: true,
        default: answers.buildCmd
      }
    ]);
    if (answersRuntime.BTPRuntime === "Kyma") {
      let cmd = ["get", "cm", "shoot-info", "-n", "kube-system", "-o", "jsonpath='{.data.domain}'"];
      if (answersRuntime.kubeconfig !== "") {
        cmd.push("--kubeconfig", answersRuntime.kubeconfig);
      }
      let opt = { "stdio": [process.stdout] };
      try {
        let resGet = this.spawnCommandSync("kubectl", cmd, opt);
        if (resGet.exitCode === 0) {
          answers.clusterDomain = resGet.stdout.toString().replace(/'/g, '');
        }
      } catch (error) {
        this.log("kubectl:", error);
      }
    }
    const answersAdditional = await this.prompt([
      {
        when: answersRuntime.BTPRuntime === "Kyma",
        type: "input",
        name: "clusterDomain",
        message: "What is the cluster domain of your SAP BTP, Kyma runtime?",
        default: answers.clusterDomain
      },
      {
        type: "input",
        name: "hdiContainerName",
        message: "What is the name of your HDI container?",
        default: answers.hdiContainerName
      },
      {
        when: answersProject.authentication === true,
        type: "confirm",
        name: "authorization",
        message: "Would you like authorization?",
        default: answers.authorization
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
        default: answers.clientHostname
      },
      {
        type: "confirm",
        name: "personalizeJWT",
        message: "Would you like HAA to propagate the application user to SAP HANA Cloud?",
        default: answers.personalizeJWT
      },
      {
        when: answersRuntime.BTPRuntime === "Kyma",
        type: "confirm",
        name: "externalSessionManagement",
        message: "Would you like to configure external session management (using Redis)?",
        default: answers.externalSessionManagement
      },
      {
        type: "confirm",
        name: "useNamedUser",
        message: "Would you like HAA to connect to SAP HANA Cloud via JWT-based SSO (this implies shadow users in SAP HANA Cloud)?",
        default: answers.useNamedUser
      }
    ]);
    if (answersProject.newDir) {
      this.destinationRoot(`${answersProject.projectName}`);
    }
    answers.destinationPath = this.destinationPath();
    this.config.set(answers);
    this.config.set(answersProject);
    this.config.set(answersRuntime);
    this.config.set(answersAdditional);
  }

  writing() {
    var answers = this.config;

    // scaffold the project
    this.sourceRoot(path.join(__dirname, "templates"));
    glob
      .sync("**", {
        cwd: this.sourceRoot(),
        nodir: true,
        dot: true
      })
      .forEach((file) => {
        if (!((file.substring(0, 5) === 'helm/' || file.includes('/Dockerfile') || file === 'dotdockerignore' || file === 'Makefile' || file === 'srv/project.toml') && answers.get('BTPRuntime') !== 'Kyma')) {
          if (!(file.includes('/Dockerfile') && answers.get('buildCmd') === 'pack')) {
            if (!((file.includes('-redis.yaml') || file.includes('destinationrule.yaml')) && answers.get('externalSessionManagement') === false)) {
              if (!((file === 'mta.yaml' || file === 'xs-security.json') && answers.get('BTPRuntime') !== 'CF')) {
                const sOrigin = this.templatePath(file);
                let fileDest = file;
                fileDest = fileDest.replace('_PROJECT_NAME_', answers.get('projectName'));
                fileDest = fileDest.replace('dotgitignore', '.gitignore');
                fileDest = fileDest.replace('dotdockerignore', '.dockerignore');
                const sTarget = this.destinationPath(fileDest);
                this.fs.copyTpl(sOrigin, sTarget, this.config.getAll());
              }
            }
          }
        }
      });
  }

  async install() {
    var answers = this.config;
    var opt = { "cwd": answers.get("destinationPath") };
    if (answers.get('BTPRuntime') === "Kyma") {
      // Kyma runtime
      let cmd;
      if (answers.get("dockerRepositoryVisibility") === "private" && !(answers.get("dockerEmailAddress") === "" && answers.get("dockerPassword") === "")) {
        cmd = ["create", "secret", "docker-registry", answers.get("dockerRegistrySecretName"), "--docker-server", answers.get("dockerServerURL"), "--docker-username", answers.get("dockerID"), "--docker-email", answers.get("dockerEmailAddress"), "--docker-password", answers.get("dockerPassword"), "-n", answers.get("namespace")];
        if (answers.get("kubeconfig") !== "") {
          cmd.push("--kubeconfig", answers.get("kubeconfig"));
        }
        this.spawnCommandSync("kubectl", cmd, opt);
        if (answers.get("externalSessionManagement") === true) {
          // generate secret
          const k8s = require('@kubernetes/client-node');
          const kc = new k8s.KubeConfig();
          kc.loadFromDefault();
          let k8sApi = kc.makeApiClient(k8s.CoreV1Api);
          this.log('Creating the external session management secret...');
          let pwdgen = require('generate-password');
          let redisPassword = pwdgen.generate({
            length: 64,
            numbers: true
          });
          let sessionSecret = pwdgen.generate({
            length: 64,
            numbers: true
          });
          let k8sSecret = {
            apiVersion: 'v1',
            kind: 'Secret',
            metadata: {
              name: answers.get('projectName') + '-redis-binding-secret',
              labels: {
                'app.kubernetes.io/managed-by': answers.get('projectName') + '-app'
              }
            },
            type: 'Opaque',
            data: {
              EXT_SESSION_MGT: Buffer.from('{"instanceName":"' + answers.get("projectName") + '-redis", "storageType":"redis", "sessionSecret": "' + sessionSecret + '"}', 'utf-8').toString('base64'),
              REDIS_PASSWORD: Buffer.from('"' + redisPassword + '"', 'utf-8').toString('base64'),
              ".metadata": Buffer.from('{"credentialProperties":[{"name":"hostname","format":"text"},{"name":"port","format":"text"},{"name":"password","format":"text"},{"name":"cluster_mode","format":"text"},{"name":"tls","format":"text"}],"metaDataProperties":[{"name":"instance_name","format":"text"},{"name":"type","format":"text"},{"name":"label","format":"text"}]}', 'utf-8').toString('base64'),
              instance_name: Buffer.from(answers.get('projectName') + '-db-' + answers.get('schemaName'), 'utf-8').toString('base64'),
              type: Buffer.from("redis", 'utf-8').toString('base64'),
              name: Buffer.from(answers.get("projectName") + "-redis", 'utf-8').toString('base64'),
              instance_name: Buffer.from(answers.get("projectName") + "-redis", 'utf-8').toString('base64'),
              hostname: Buffer.from(answers.get("projectName") + "-redis", 'utf-8').toString('base64'),
              port: Buffer.from("6379", 'utf-8').toString('base64'),
              password: Buffer.from(redisPassword, 'utf-8').toString('base64'),
              cluster_mode: Buffer.from("false", 'utf-8').toString('base64'),
              tls: Buffer.from("false", 'utf-8').toString('base64')
            }
          };
          await k8sApi.createNamespacedSecret(
            answers.get('namespace'),
            k8sSecret
          ).catch(e => this.log("createNamespacedSecret:", e.response.body));
        }
      }
    }
    answers.delete('dockerEmailAddress');
    answers.delete('dockerPassword');
  }

  end() {
    this.log("");
    this.log("Don't forget to add the SAP HANA Analytics Adapter WAR file (java-xsahaa.war) to the target folder. You can download the SAP HANA Analytics Adapter from https://tools.hana.ondemand.com/#hanatools");
    this.log("");
  }
}