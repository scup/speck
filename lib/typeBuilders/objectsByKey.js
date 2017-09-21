"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

module.exports = function objectsByKey(Type) {
  return {
    type: Type,
    validator: Type.SCHEMA,
    builder: function builder(data) {
      function buildTypeWithDataForKeys(result, key) {
        return _extends({}, result, _defineProperty({}, key, new Type(data[key])));
      }

      return Object.keys(data).reduce(buildTypeWithDataForKeys, {});
    }
  };
};