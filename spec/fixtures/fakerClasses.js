import Faker from 'faker';
import { PropTypes } from 'react';

import Speck, { SpeckCollection } from '../../src/Speck';

const defaultField = Faker.name.firstName();
const defaultValue = Faker.name.firstName();

const fooValidator = function (data, propName){
  if(data[propName] !== 'bar'){
    return `${propName} accepts just 'bar' as value`;
  }
};

class FakeEntityWithDefault extends Speck {
  static SCHEMA = {
    [defaultField]: {
      validator: function (){},
      defaultValue: defaultValue
    },
    [`_${defaultField}`]: {
      validator: function (){},
      defaultValue: `_${defaultValue}`
    },
  }
}

function alwaysTruth(){
  return true;
}

class ProductEntity extends Speck {
  static SCHEMA = {
    name: alwaysTruth,
    price: alwaysTruth
  }
}

class ProductEntityCollection extends SpeckCollection {
  static TYPE = ProductEntity;

  getSortedItemsByName() {
    return this.sortBy('name');
  }
}

class Validatable extends Speck {
  static SCHEMA = {
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
  }
}

class ChildrenEntity  extends Speck {
  static SCHEMA = {
    foo: fooValidator
  }
}

class FatherEntity extends Speck {
  static SCHEMA = {
    foo: {
      validator: fooValidator,
      defaultValue: 'bar'
    }, children: {
      validator: function (){},
      type: ChildrenEntity
    }
  }
}

class FatherWithObjectEntity extends Speck {
  static SCHEMA = {
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
}

class ChildWithChildArray extends Speck {
    static SCHEMA = {
        name: PropTypes.string,
        children: {
            validator: PropTypes.arrayOf(PropTypes.instanceOf(ChildWithChildArray)),
            type: ChildWithChildArray
        }
    }
}

export default {
  defaultField,
  defaultValue,
  FakeEntityWithDefault,
  ProductEntity,
  ProductEntityCollection,
  Validatable,
  ChildrenEntity,
  FatherEntity,
  FatherWithObjectEntity,
  ChildWithChildArray
}
