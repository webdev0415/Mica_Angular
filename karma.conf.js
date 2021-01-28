// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-phantomjs-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require("karma-nyan-reporter")
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    mime: {
      "text/x-typescript": ["ts","tsx"]
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'), reports: [ 'html', 'lcovonly', "text-summary" ],
      fixWebpackSourcePaths: true,
      thresholds: {
        statements: 90,
        branches: 80
      }
    },

    reporters: config.angularCli && config.angularCli.codeCoverage
          ? ['nyan', 'coverage-istanbul']
          : ['nyan', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: true,
    browsers: ["Chrome", "PhantomJS", "ChromeHeadlessNoSandbox"],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: false,
    browserNoActivityTimeout: 100000,
    browserDisconnectTolerance: 2
  });
};
