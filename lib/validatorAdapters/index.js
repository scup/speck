"use strict";

var adapters = new Map();

module.exports = function validatorAdapter(adapterName, validatorClass) {
  var adapter = adapters.get(validatorClass);

  if (adapter) return adapter;

  var newAdapter = require("./" + adapterName).Adapter(validatorClass);
  adapters.set(validatorClass, newAdapter);
  return newAdapter;
};