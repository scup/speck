"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (adapterName, validatorClass) {
  return require("./" + adapterName).Adapter(validatorClass);
};