'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validatorAdapter = exports.Collection = exports.Types = exports.Entity = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validatorAdapters = require('./validatorAdapters');

var _validatorAdapters2 = _interopRequireDefault(_validatorAdapters);

var _SpeckCollection = require('./SpeckCollection');

var _SpeckCollection2 = _interopRequireDefault(_SpeckCollection);

var _objectsByKey = require('./typeBuilders/objectsByKey');

var _objectsByKey2 = _interopRequireDefault(_objectsByKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createGetterAndSetter = function createGetterAndSetter(instance, field) {
  return {
    set: function set(value) {
      if (instance.data[field] !== value) {
        instance.data[field] = value;
        return instance._validate();
      }
    },
    get: function get() {
      return instance.data[field];
    },
    enumerable: true
  };
};

var Speck = function () {
  function Speck(data) {
    var _this = this;

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
      value: Object.keys(this.constructor.SCHEMA).filter(function (field) {
        return !!_this.constructor.SCHEMA[field].type;
      }),
      enumerable: false
    });

    this.errors = {};
    Object.defineProperty(this, 'data', {
      value: this._mergeDefault(data || {}),
      enumerable: false
    });

    this._validate();
  }

  _createClass(Speck, [{
    key: 'applyEntityConstructor',
    value: function applyEntityConstructor(field, data) {
      if (!data) return;

      var Type = field.type;

      if (field.builder) {
        return field.builder(data, Type);
      }

      if (Array.isArray(data)) {
        return data.map(function (instance) {
          return new Type(instance);
        });
      }

      return new Type(data);
    }
  }, {
    key: '_mergeDefault',
    value: function _mergeDefault(data) {
      var newData = {};
      var field = void 0;
      for (field in this.schema) {

        newData[field] = data[field] || this.schema[field].defaultValue;

        if (this.schema[field].type) {
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
      if (fieldValue) if (fieldValue.fetch) {
        return fieldValue.fetch();
      }

      return fieldValue;
    }
  }, {
    key: '__validateField',
    value: function __validateField(field) {
      var validator = typeof this.schema[field] === 'function' ? this.schema[field] : this.schema[field].validator;

      var error = validator(this.data, field, this.constructor.name + 'Entity');

      if (error) {
        if (!this.errors[field]) {
          this.errors[field] = { errors: [] };
        }

        this.errors[field].errors.push(error.message || error);
      }
    }
  }, {
    key: '_validate',
    value: function _validate() {
      this.errors = {};

      var field = void 0;
      for (field in this.schema) {
        this.__validateField(field);
      }
      this.valid = Object.keys(this.errors).length === 0;

      if (!this.valid) {
        return this.errors;
      }
    }
  }, {
    key: 'fetch',
    value: function fetch() {
      console.log('fetch() will be deprecated, use toJSON().');
      return this.toJSON();
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var rawData = {};
      for (var field in this.data) {
        rawData[field] = this._fetchChild(this.data[field]);
      }
      return JSON.parse(JSON.stringify(rawData));
    }
  }, {
    key: 'getErrors',
    value: function getErrors() {
      var _this2 = this;

      this._validate();
      var errors = Object.assign({}, this.errors);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var field = _step.value;

          var children = Array.isArray(_this2[field]) ? _this2[field] : [_this2[field]];

          children.forEach(function (entity, index) {
            if (!entity.valid) {
              if (errors[field] === undefined) {
                errors[field] = {};
              }

              errors[field][index] = entity.getErrors();
            }
          });
        };

        for (var _iterator = this.childrenEntities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return errors;
    }
  }, {
    key: 'validateContext',
    value: function validateContext(context) {
      var _this3 = this;

      if (!this.contexts[context]) return this.errors;

      var validation = function validation() {
        return true;
      };
      if (this.contexts[context].exclude && Object.keys(this.contexts[context].exclude).length > 0) {
        validation = function validation(error) {
          return _this3.contexts[context].exclude.find(function (exclude) {
            return exclude === error;
          }) === undefined;
        };
      }

      if (this.contexts[context].include && Object.keys(this.contexts[context].include).length > 0) {
        validation = function validation(error) {
          return _this3.contexts[context].include.find(function (include) {
            return include === error;
          }) !== undefined;
        };
      }

      var contextErrors = _extends({}, this.errors);
      if (this.contexts[context].fields) {
        Object.keys(this.contexts[context].fields).forEach(function (field) {
          var result = _this3.contexts[context].fields[field](_this3, field, _this3.constructor.name);
          if (result) contextErrors[field] = { errors: result };else delete contextErrors[field];
        });
      }

      var errors = Object.keys(contextErrors).filter(validation);

      return errors.reduce(function (acc, e) {
        acc[e] = contextErrors[e];
        return acc;
      }, {});
    }
  }]);

  return Speck;
}();

Speck.Types = { objectsByKey: _objectsByKey2.default };

Speck.Types = Speck.Types;
Speck.Collection = _SpeckCollection2.default;
Speck.Types = { objectsByKey: _objectsByKey2.default };
Speck.validatorAdapter = _validatorAdapters2.default;

var Entity = exports.Entity = Speck;
var Types = exports.Types = Speck.Types;
var Collection = exports.Collection = Speck.Collection;
var validatorAdapter = exports.validatorAdapter = Speck.validatorAdapter;

exports.default = Speck;