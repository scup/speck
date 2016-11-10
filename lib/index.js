'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validatorAdapter = exports.Collection = exports.Types = exports.Entity = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Speck = require('./Speck.js');

var _Speck2 = _interopRequireDefault(_Speck);

var _validatorAdapters = require('./validatorAdapters');

var _validatorAdapters2 = _interopRequireDefault(_validatorAdapters);

var _SpeckCollection = require('./SpeckCollection');

var _SpeckCollection2 = _interopRequireDefault(_SpeckCollection);

var _objectsByKey = require('./typeBuilders/objectsByKey');

var _objectsByKey2 = _interopRequireDefault(_objectsByKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_extends(_Speck2.default, {
  Types: { objectsByKey: _objectsByKey2.default },
  Collection: _SpeckCollection2.default,
  validatorAdapter: _validatorAdapters2.default
});

var Entity = exports.Entity = _Speck2.default;
var Types = exports.Types = _Speck2.default.Types;
var Collection = exports.Collection = _Speck2.default.Collection;
var validatorAdapter = exports.validatorAdapter = _Speck2.default.validatorAdapter;

exports.default = _Speck2.default;