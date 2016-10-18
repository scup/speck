"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var objectsByKey = function objectsByKey(Type) {
  return {
    type: Type,
    validator: Type.SCHEMA,
    builder: function builder(data) {
      return Object.keys(data).reduce(function (result, key) {
        result[key] = new Type(data[key]);
        return result;
      }, {});
    }
  };
};

exports.default = objectsByKey;