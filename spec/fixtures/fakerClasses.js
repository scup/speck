const Faker = require('faker')
const Joi = require('joi')
const joiAdapter = require('validatorAdapters')('joi', Joi)

const { noop } = require('lodash')

const Speck = require('Speck')

const defaultField = Faker.name.firstName()
const defaultValue = Faker.name.firstName()

const fooValidator = function (data, propName) {
  if (data[propName] !== 'bar') {
    return `${propName} accepts just 'bar' as value`
  }
}

class FakeEntityWithDefault extends Speck { }

class FakeEntityWithBoolean extends Speck { }
FakeEntityWithBoolean.SCHEMA = {
  isDefault: joiAdapter(Joi.boolean())
}

class FakeEntityWithObject extends Speck { }
FakeEntityWithObject.SCHEMA = {
  config: {
    validator: joiAdapter(Joi.object()),
    defaultValue: {}
  }
}

function alwaysTruth () {
  return true
}

class FakeEntityWithCustomElementList extends Speck {}
FakeEntityWithCustomElementList.SCHEMA = {
  elements: {
    validator: noop,
    builder: (dataList) => dataList.map(data => {
      if (data.type === 'product') return new ProductEntity(data)
      if (data.type === 'default') return new FakeEntityWithBoolean(data)
    })
  }
}

class ProductEntity extends Speck { }
ProductEntity.SCHEMA = {
  name: alwaysTruth,
  price: alwaysTruth
}

class Validatable extends Speck { }
Validatable.SCHEMA = {
  field: function (data, propName, entityName) {
    if (data[propName] !== 'valid') {
      return `${propName} wrong on ${entityName}`
    }
  },
  otherField: {
    validator: function (data, propName, entityName) {
      if (data[propName] !== 'valid') {
        return new Error(`${propName} wrong on ${entityName}`)
      }
    },
    defaultValue: 'bla'
  }
}

class ChildrenEntity extends Speck {}
ChildrenEntity.SCHEMA = {
  foo: fooValidator
}

FakeEntityWithDefault.SCHEMA = {
  [defaultField]: {
    validator: noop,
    defaultValue: defaultValue
  },
  [`_${defaultField}`]: {
    validator: noop,
    defaultValue: `_${defaultValue}`
  },
  child: {
    validator: joiAdapter(Joi.object().type(ChildrenEntity)),
    type: ChildrenEntity
  },
  children: {
    validator: joiAdapter(Joi.array().items(Joi.object().type(ChildrenEntity))),
    type: ChildrenEntity
  },
  functionAsDefault: {
    validator: joiAdapter(Joi.func()),
    defaultValue: () => 'I should not be an object'
  }
}

class FatherEntity extends Speck { }
FatherEntity.SCHEMA = {
  foo: {
    validator: fooValidator,
    defaultValue: 'bar'
  },
  children: {
    validator: noop,
    type: ChildrenEntity
  },
  child: {
    validator: noop,
    type: ChildrenEntity
  }
}

class FatherWithObjectEntity extends Speck { }
FatherWithObjectEntity.SCHEMA = {
  children: {
    type: ChildrenEntity,
    validator: alwaysTruth,
    builder: (data, Type) => {
      return Object.keys(data).reduce((result, key) => {
        result[key] = new Type(data[key])
        return result
      }, {})
    }
  }
}

class FakeEntityWithExcludeContext extends Speck { }
FakeEntityWithExcludeContext.SCHEMA = {
  id: joiAdapter(Joi.number().required()),
  requiredProp1: joiAdapter(Joi.number().required()),
  requiredProp2: joiAdapter(Joi.number().required()),
  requiredProp3: joiAdapter(Joi.number().required())
}

FakeEntityWithExcludeContext.CONTEXTS = {
  create: { exclude: [ 'id', 'requiredProp3' ] },
  edit: { exclude: [ 'id', 'requiredProp2' ] }
}

class FakeEntityWithIncludeContext extends Speck { }
FakeEntityWithIncludeContext.SCHEMA = {
  id: joiAdapter(Joi.number().required()),
  requiredProp1: joiAdapter(Joi.number().required()),
  requiredProp2: joiAdapter(Joi.number().required()),
  requiredProp3: joiAdapter(Joi.number().required())
}

FakeEntityWithIncludeContext.CONTEXTS = {
  create: { include: [ 'requiredProp1', 'requiredProp2' ] }
}

class FakeEntityWithCustomValidationWithContext extends Speck { }
FakeEntityWithCustomValidationWithContext.SCHEMA = {
  id: joiAdapter(Joi.number().required()),
  requiredProp1: joiAdapter(Joi.number().required())
}

FakeEntityWithCustomValidationWithContext.CONTEXTS = {
  create: {
    fields: {
      requiredProp1: (obj, field) => {
        if (obj[field] === -1) return new Error('Error -1')
      }
    }
  }
}

Object.assign(exports, {
  defaultField,
  defaultValue,
  FakeEntityWithDefault,
  FakeEntityWithBoolean,
  FakeEntityWithObject,
  ProductEntity,
  Validatable,
  ChildrenEntity,
  FatherEntity,
  FatherWithObjectEntity,
  FakeEntityWithExcludeContext,
  FakeEntityWithIncludeContext,
  FakeEntityWithCustomValidationWithContext,
  FakeEntityWithCustomElementList
})
