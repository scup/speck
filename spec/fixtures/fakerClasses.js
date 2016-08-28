import Faker from 'faker';
import { PropTypes } from 'react';

import Speck from '../../src/Speck';

const defaultField = Faker.name.firstName();
const defaultValue = Faker.name.firstName();

const fooValidator = function (data, propName){
  if(data[propName] !== 'bar'){
    return `${propName} accepts just 'bar' as value`;
  }
};

class FakeEntityWithDefault extends Speck { }

function alwaysTruth(){
  return true;
}

class ProductEntity extends Speck { }
ProductEntity.SCHEMA = {
  name: alwaysTruth,
  price: alwaysTruth
};

class Validatable extends Speck { }
Validatable.SCHEMA = {
  field: function (data, propName, entityName){
    if(data[propName] !== 'valid'){
      return `${propName} wrong on ${entityName}`;
    }
  },
  otherField: {
    validator: function (data, propName, entityName){
      if(data[propName] !== 'valid'){
        return new Error(`${propName} wrong on ${entityName}`);
      }
    },
    defaultValue: 'bla'
  }
};

class ChildrenEntity extends Speck { }
ChildrenEntity.SCHEMA = {
  foo: fooValidator
};

FakeEntityWithDefault.SCHEMA = {
  [defaultField]: {
    validator: function (){},
    defaultValue: defaultValue
  },
  [`_${defaultField}`]: {
    validator: function (){},
    defaultValue: `_${defaultValue}`
  },
  child: {
    validator: PropTypes.instanceOf(ChildrenEntity),
    type: ChildrenEntity
  },
  children: {
    validator: PropTypes.arrayOf(PropTypes.instanceOf(ChildrenEntity)),
    type: ChildrenEntity
  }
};

class FatherEntity extends Speck { }
FatherEntity.SCHEMA = {
  foo: {
    validator: fooValidator,
    defaultValue: 'bar'
  }, children: {
    validator: function (){},
    type: ChildrenEntity
  }
};

class FatherWithObjectEntity extends Speck { }
FatherWithObjectEntity.SCHEMA = {
  children: {
    type: ChildrenEntity,
    validator: alwaysTruth,
    builder: (data, Type) => {
      return Object.keys(data).reduce((result, key) => {
        result[key] = new Type(data[key]);
        return result;
      },{})
    }
  }
}

class FakeEntityWithExcludeContext extends Speck { }
FakeEntityWithExcludeContext.SCHEMA = {
    id: PropTypes.number.isRequired,
    requiredProp1: PropTypes.number.isRequired,
    requiredProp2: PropTypes.number.isRequired,
    requiredProp3: PropTypes.number.isRequired
};

FakeEntityWithExcludeContext.CONTEXTS = {
  create: { exclude: [ 'id', 'requiredProp3' ] },
  edit: { exclude: [ 'id', 'requiredProp2' ] }
};

class FakeEntityWithIncludeContext extends Speck { }
FakeEntityWithIncludeContext.SCHEMA = {
  id: PropTypes.number.isRequired,
  requiredProp1: PropTypes.number.isRequired,
  requiredProp2: PropTypes.number.isRequired,
  requiredProp3: PropTypes.number.isRequired
};

FakeEntityWithIncludeContext.CONTEXTS = {
  create: { include: [ 'requiredProp1', 'requiredProp2' ] }
};

class FakeEntityWithCustomValidationWithContext extends Speck { }
FakeEntityWithCustomValidationWithContext.SCHEMA = {
  id: PropTypes.number.isRequired,
  requiredProp1: PropTypes.number.isRequired
};

FakeEntityWithCustomValidationWithContext.CONTEXTS = {
  create: {
    fields: {
      requiredProp1: (obj, field) => {
        if(obj[field] === -1) return new Error('Error -1');
      }
    }
  }
};

Object.assign(exports, {
  defaultField,
  defaultValue,
  FakeEntityWithDefault,
  ProductEntity,
  Validatable,
  ChildrenEntity,
  FatherEntity,
  FatherWithObjectEntity,
  FakeEntityWithExcludeContext,
  FakeEntityWithIncludeContext,
  FakeEntityWithCustomValidationWithContext
});
