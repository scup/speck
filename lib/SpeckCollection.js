'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LODASH_METHODS = ['chunk', 'compact', 'concat', 'countBy', 'difference', 'differenceBy', 'differenceWith', 'drop', 'dropRight', 'dropRightWhile', 'dropWhile', 'each', 'eachRight', 'every', 'fill', 'filter', 'find', 'findIndex', 'findLast', 'findLastIndex', 'first', 'flatMap', 'flatten', 'flattenDeep', 'flattenDepth', 'forEach', 'forEachRight', 'fromPairs', 'groupBy', 'head', 'includes', 'indexOf', 'initial', 'intersection', 'intersectionBy', 'intersectionWith', 'invokeMap', 'join', 'keyBy', 'last', 'lastIndexOf', 'map', 'orderBy', 'partition', 'pull', 'pullAll', 'pullAllBy', 'pullAllWith', 'pullAt', 'reduce', 'reduceRight', 'reject', 'remove', 'reverse', 'sample', 'sampleSize', 'shuffle', 'size', 'slice', 'some', 'sortBy', 'sortedIndex', 'sortedIndexBy', 'sortedIndexOf', 'sortedLastIndex', 'sortedLastIndexBy', 'sortedLastIndexOf', 'sortedUniq', 'sortedUniqBy', 'tail', 'take', 'takeRight', 'takeRightWhile', 'takeWhile', 'union', 'unionBy', 'unionWith', 'uniq', 'uniqBy', 'uniqWith', 'unzip', 'unzipWith', 'without', 'xor', 'xorBy', 'xorWith', 'zip', 'zipObject', 'zipObjectDeep', 'zipWith'];

var SpeckCollection = function () {
  function SpeckCollection(data) {
    var _this = this;

    _classCallCheck(this, SpeckCollection);

    this.items = _lodash2.default.map(data, function (item) {
      if (_lodash2.default.isNil(item) || _lodash2.default.isPlainObject(item)) {
        return new _this.constructor.TYPE(item);
      }

      return item;
    });
  }

  _createClass(SpeckCollection, [{
    key: 'toJSON',
    value: function toJSON() {
      return this.items.map(function (item) {
        return item.toJSON();
      });
    }
  }, {
    key: 'result',
    value: function result() {
      return this.items;
    }
  }]);

  return SpeckCollection;
}();

var reduceToNewItem = function reduceToNewItem(all, arg) {
  all.push(arg);
  return all;
};

_lodash2.default.each(LODASH_METHODS, function (method) {
  SpeckCollection.prototype[method] = function () {
    var args = _lodash2.default.reduce(arguments, reduceToNewItem, [this.items]);

    var result = _lodash2.default[method].apply(_lodash2.default, args);

    if (!_lodash2.default.isArray(result)) {
      return result;
    }

    return new this.constructor(result);
  };
});

exports.default = SpeckCollection;