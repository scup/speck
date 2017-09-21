const _ = require('lodash')

const LODASH_METHODS = [
  'chunk', 'compact', 'concat', 'countBy', 'difference',
  'differenceBy', 'differenceWith', 'drop', 'dropRight',
  'dropRightWhile', 'dropWhile', 'each', 'eachRight',
  'every', 'fill', 'filter', 'find', 'findIndex',
  'findLast', 'findLastIndex', 'first', 'flatMap',
  'flatten', 'flattenDeep', 'flattenDepth', 'forEach',
  'forEachRight', 'fromPairs', 'groupBy', 'head',
  'includes', 'indexOf', 'initial', 'intersection',
  'intersectionBy', 'intersectionWith', 'invokeMap',
  'join', 'keyBy', 'last', 'lastIndexOf', 'map', 'orderBy',
  'partition', 'pull', 'pullAll', 'pullAllBy', 'pullAllWith',
  'pullAt', 'reduce', 'reduceRight', 'reject', 'remove',
  'reverse', 'sample', 'sampleSize', 'shuffle', 'size',
  'slice', 'some', 'sortBy', 'sortedIndex', 'sortedIndexBy',
  'sortedIndexOf', 'sortedLastIndex', 'sortedLastIndexBy',
  'sortedLastIndexOf', 'sortedUniq', 'sortedUniqBy', 'tail', 'take',
  'takeRight', 'takeRightWhile', 'takeWhile', 'union', 'unionBy',
  'unionWith', 'uniq', 'uniqBy', 'uniqWith', 'unzip', 'unzipWith',
  'without', 'xor', 'xorBy', 'xorWith', 'zip', 'zipObject',
  'zipObjectDeep', 'zipWith'
]

class SpeckCollection {
  constructor (data) {
    this.items = _.map(data, (item) => {
      if (_.isNil(item) || _.isPlainObject(item)) {
        return new this.constructor.TYPE(item)
      }

      return item
    })
  }

  toJSON () {
    return this.items.map(item => item.toJSON())
  }

  result () {
    return this.items
  }
}

const reduceToNewItem = (all, arg) => {
  all.push(arg)
  return all
}

_.each(LODASH_METHODS, (method) => {
  SpeckCollection.prototype[method] = function () {
    const args = _.reduce(arguments, reduceToNewItem, [ this.items ])

    const result = _[method].apply(_, args)

    if (!_.isArray(result)) return result

    return new this.constructor(result)
  }
})

module.exports = SpeckCollection
