require("babel-core/register")();

var Jasmine = require('jasmine');
var SpecReporter = require('jasmine-spec-reporter');

var jrunner = new Jasmine();
jasmine.getEnv().addReporter(new SpecReporter()); // add jasmine-spec-reporter
jrunner.loadConfigFile('spec/jasmine.json');      // load jasmine.json configuration
jrunner.execute();
