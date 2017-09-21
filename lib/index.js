'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Speck = require('./Speck.js');

var SpeckValidatorAdapters = require('./validatorAdapters');
var SpeckCollection = require('./SpeckCollection');
var objectsByKey = require('./typeBuilders/objectsByKey');

_extends(Speck, {
  Types: { objectsByKey: objectsByKey },
  Collection: SpeckCollection,
  validatorAdapter: SpeckValidatorAdapters
});

module.exports = _extends({}, Speck, {
  Entity: Speck,
  Types: Speck.Types,
  Collection: Speck.Collection,
  validatorAdapter: Speck.validatorAdapter
});