"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Adapter = exports.Adapter = function Adapter(Joi) {
  return function JoiValidatorAdapter(joiChain) {
    return function PropTypesValidator(props, propName) {
      var schema = Joi.object().keys(_defineProperty({}, propName, joiChain));
      var result = Joi.validate(_defineProperty({}, propName, props[propName]), schema);
      if (result.error) {
        return new Error("Joi" + result.error);
      }
    };
  };
};