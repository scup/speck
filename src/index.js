const Speck = require('./Speck.js')

const SpeckValidatorAdapters = require('./validatorAdapters')
const SpeckCollection = require('./SpeckCollection')
const objectsByKey = require('./typeBuilders/objectsByKey')

Object.assign(Speck, {
  Types: { objectsByKey },
  Collection: SpeckCollection,
  validatorAdapter: SpeckValidatorAdapters
})

module.exports = Object.assign({}, Speck, {
  Entity: Speck,
  Types: Speck.Types,
  Collection: Speck.Collection,
  validatorAdapter: Speck.validatorAdapter
})
