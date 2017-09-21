const Joi = require('joi')
const joiAdapter = require('validatorAdapters')('joi', Joi)

const Speck = require('Speck')
const SpeckCollection = require('SpeckCollection')
const { ProductEntity } = require('./fakerClasses')

class ProductEntityCollection extends SpeckCollection {
  getSortedItemsByName () {
    return this.sortBy('name')
  }
}

ProductEntityCollection.TYPE = ProductEntity

class ChildWithChildArray extends Speck { }
ChildWithChildArray.SCHEMA = {
  name: joiAdapter(Joi.string()),
  children: {
    validator: joiAdapter(Joi.array().items(Joi.object().type(ChildWithChildArray))),
    type: ChildWithChildArray
  }
}

Object.assign(exports, { ProductEntityCollection, ChildWithChildArray })
