'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('lodash'),
    clone = _require.clone,
    get = _require.get,
    isNil = _require.isNil,
    isFunction = _require.isFunction,
    noop = _require.noop;

function applyAfterSetHook(field, data, afterSetHook) {
  var newData = afterSetHook(data, field);
  (typeof newData === 'undefined' ? 'undefined' : _typeof(newData)) === 'object' && _extends(data, newData);
}

function createGetterAndSetter(instance, field) {
  var schemaField = instance.schema[field];

  var afterSet = get(schemaField, 'hooks.afterSet');
  var afterSetHook = typeof afterSet === 'function' ? applyAfterSetHook : noop;

  return {
    set: function set(newValue) {
      if (instance.data[field] !== newValue) {
        instance.data[field] = newValue;

        afterSetHook(field, instance.data, afterSet);

        return instance._validate();
      }
    },
    get: function get() {
      return instance.data[field];
    },

    enumerable: true
  };
}

var Speck = function () {
  function Speck() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Speck);

    Object.defineProperty(this, 'schema', {
      value: this.constructor.SCHEMA,
      enumerable: false
    });

    Object.defineProperty(this, 'contexts', {
      value: this.constructor.CONTEXTS,
      enumerable: false
    });

    Object.defineProperty(this, 'childrenEntities', {
      value: Object.keys(this.constructor.SCHEMA).filter(this.__fieldHasType.bind(this)),
      enumerable: false
    });

    Object.defineProperty(this, 'data', {
      value: this._mergeDefault(data),
      enumerable: false
    });

    this._validate();
  }

  _createClass(Speck, [{
    key: '__fieldHasType',
    value: function __fieldHasType(field) {
      return !!this.constructor.SCHEMA[field].type;
    }
  }, {
    key: '__initFieldValue',
    value: function __initFieldValue(field, data) {
      var hasValue = !isNil(data[field]);

      if (hasValue) return data[field];

      var defaultValue = this.schema[field].defaultValue;
      var isFunction = defaultValue instanceof Function;

      return isFunction ? defaultValue : clone(this.schema[field].defaultValue);
    }
  }, {
    key: '_mergeDefault',
    value: function _mergeDefault(data) {
      var newData = {};
      var field = void 0;
      for (field in this.schema) {
        newData[field] = this.__initFieldValue(field, data);

        if (this.schema[field].type || this.schema[field].builder) {
          newData[field] = this.applyEntityConstructor(this.schema[field], newData[field]);
        }

        Object.defineProperty(this, field, createGetterAndSetter(this, field));
      }
      return newData;
    }
  }, {
    key: '_fetchChild',
    value: function _fetchChild(fieldValue) {
      if (Array.isArray(fieldValue)) {
        return fieldValue.map(this._fetchChild);
      }

      if (fieldValue && typeof fieldValue.toJSON === 'function') {
        return fieldValue.toJSON();
      }

      return fieldValue;
    }
  }, {
    key: '__validateField',
    value: function __validateField(field) {
      var validator = typeof this.schema[field] === 'function' ? this.schema[field] : this.schema[field].validator;

      return validator(this.data, field, this.constructor.name + 'Entity');
    }
  }, {
    key: '_validate',
    value: function _validate() {
      this.errors = {};

      for (var field in this.schema) {
        var error = this.__validateField(field);

        if (error) {
          this.errors[field] = { errors: [error.message || error] };
        }
      }
      this.valid = Object.keys(this.errors).length === 0;

      if (!this.valid) {
        return this.errors;
      }
    }
  }, {
    key: '_includeChildErrors',
    value: function _includeChildErrors(field, errors, entity, index) {
      if (!entity.valid) {
        if (errors[field] === undefined) {
          errors[field] = {};
        }

        errors[field][index] = entity.getErrors();
      }
      return errors;
    }
  }, {
    key: '_getChildrenErrors',
    value: function _getChildrenErrors(errors, field) {
      var children = Array.isArray(this[field]) ? this[field] : [this[field]];

      return children.reduce(this._includeChildErrors.bind(this, field), errors);
    }
  }, {
    key: 'applyEntityConstructor',
    value: function applyEntityConstructor(field, data) {
      var Type = field.type;

      if (isFunction(field.builder)) {
        return field.builder(data, Type);
      }

      if (!data) return;

      if (Array.isArray(data)) {
        return data.map(function (instance) {
          return new Type(instance);
        });
      }

      return new Type(data);
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this = this;

      var rawData = Object.keys(this.data).reduce(function (data, field) {
        return _extends(data, _defineProperty({}, field, _this._fetchChild(_this.data[field])));
      }, {});

      return JSON.parse(JSON.stringify(rawData));
    }
  }, {
    key: 'getErrors',
    value: function getErrors() {
      var errors = _extends({}, this._validate());

      return this.childrenEntities.reduce(this._getChildrenErrors.bind(this), errors);
    }
  }, {
    key: 'validateContext',
    value: function validateContext(context) {
      var _this2 = this;

      if (!get(this.contexts, context)) return this.errors;

      var validation = function validation() {
        return true;
      };
      if (this.contexts[context].exclude && Object.keys(this.contexts[context].exclude).length > 0) {
        validation = function validation(error) {
          return _this2.contexts[context].exclude.find(function (exclude) {
            return exclude === error;
          }) === undefined;
        };
      }

      if (this.contexts[context].include && Object.keys(this.contexts[context].include).length > 0) {
        validation = function validation(error) {
          return _this2.contexts[context].include.find(function (include) {
            return include === error;
          }) !== undefined;
        };
      }

      var contextErrors = _extends({}, this.errors);
      if (this.contexts[context].fields) {
        Object.keys(this.contexts[context].fields).forEach(function (field) {
          var result = _this2.contexts[context].fields[field](_this2, field, _this2.constructor.name);
          result && (contextErrors[field] = { errors: result });
        });
      }

      var errors = Object.keys(contextErrors).filter(validation);

      var contextValidation = errors.reduce(function (newError, errorField) {
        newError[errorField] = contextErrors[errorField];
        return newError;
      }, {});

      return _extends({ valid: !Object.keys(contextValidation).length }, contextValidation);
    }
  }]);

  return Speck;
}();

module.exports = Speck;