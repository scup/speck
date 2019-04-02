# ![Speck](http://i.imgur.com/UMjf7SI.jpg)

## Speck - Let you create your domain entities with reactive validation based on [React](https://github.com/facebook/react) [propTypes](https://facebook.github.io/react/docs/reusable-components.html)

[![Build Status](https://travis-ci.org/scup/speck.svg?branch=master)](https://travis-ci.org/scup/speck)

This package let you create entities with schema validation based on React PropTypes.

* [Installing](#installing)
* [Using](#using)
* [Examples](#examples)

### Installing
    $ npm install speck-entity


### Using

#### Sample Entities
```javascript
const Joi = require('joi')
const joiAdapter = require('validatorAdapters')('joi', Joi)
const Speck = require('speck-entity')

class MyEntity extends Speck {
  static SCHEMA = {
    field: joiAdapter(Joi.string()),
    otherField: {
      validator: joiAdapter(Joi.number()),
      defaultValue: 10
    }
  }
}

class FatherEntity extends Speck {
  static SCHEMA = {
    children: {
      validator: joiAdapter(Joi.array().items(Joi.object().type(MyEntity)))
      type: MyEntity
    }
  }
}
```

#### Get default values
```javascript
const niceInstance = new MyEntity();
console.log(niceInstance.toJSON()); // { field: undefined, otherField: 10 }
console.log(niceInstance.errors); // {}
```

#### Validations
```javascript
const buggedInstance = new MyEntity({ field: 10, otherField: 'value' });
console.log(buggedInstance.toJSON()); // { field: 10, otherField: 'value' }
console.log(buggedInstance.errors); /* or buggedInstance.getErrors() -- but... getErrors also includes children errors
  {
    field: {
      errors: [ 'Invalid undefined `field` of type `number` supplied to `MyEntityEntity`, expected `string`.' ]
    },
    otherField: {
      errors: [ 'Invalid undefined `otherField` of type `string` supplied to `MyEntityEntity`, expected `number`.' ]
    }
  }
*/
```

#### Validate on change value
```javascript
const otherInstance = new MyEntity({ field: 'myString' });
console.log(otherInstance.errors); // {}
console.log(otherInstance.valid); // true

otherInstance.field = 1;
console.log(otherInstance.errors); // {field: { errors: [ 'Invalid undefined `field` of type `number` supplied to `MyEntityEntity`, expected `string`.' ] }}
console.log(otherInstance.valid); // false
```

#### Parse children to Entity
```javascript
const fatherInstance = new FatherEntity({
  children: [{
    field: 'A',
    otherField: 2
  }, {
    field: 'B',
    otherField: 3
  }]  
})
console.log(fatherInstance.children[0]); //An instance of MyEntity
console.log(fatherInstance.children[1].toJSON());
//{ field: 'B', otherField: 3 }
```
#### Builder
When you need to create objects with custom verification like
```javascript
    const elementList = {
        elements: [{
          type: 'product',
          name: true,
          price:  true
        }, {
          type: 'default',
          isDefault: true
        }]
      };
```
In such cases you can define a builder as follows:
```javascript
class ElementList extends Speck {}
ElementList.SCHEMA = {
  elements: {
    validator: noop,
    builder: (dataList, Type, dependencies) => dataList.map(data => {
      if (data.type === 'product') return new ProductEntity(data, dependencies);
      if (data.type === 'default') return new FakeEntityWithBoolean(data);
    })
  }
};
```
And use it like:
```javascript
new ElementList(elementList, someDependency)
```
(note that you can pass custom dependencies to your child entities and latter access them on the builder)

By defining builder you tell Speck Entity that you take the responsibility of instansitating and
returning a new object of the type which suits you the best.
This is a powerful concept as it lets users dynamically create new types on the fly.
#### Clean unexpected values
```javascript
const anotherInstance = new MyEntity({ field: 'myString', fake: 'fake' });
console.log(anotherInstance.toJSON()); // { field: 'myString', otherField: 10 }
```
To understand the validators [React PropTypes](https://facebook.github.io/react/docs/reusable-components.html)

### Well known issues
  - Create helpers for relationships validations(Like, mininum, maximum)
  - Create identifier and equal comparison
  - Type builders and/or custom builders are not being applied on instance setters

### Contextual validation
```javascript
  class FakeEntityWithExcludeContext extends Speck {
      static SCHEMA = {
          id: joiAdapter(Joi.number().required()),
          requiredProp1: joiAdapter(Joi.number().required()),
          requiredProp2: joiAdapter(Joi.number().required()),
          requiredProp3: joiAdapter(Joi.number().required())
      }

      static CONTEXTS = {
        create: { exclude: [ 'requiredProp2', 'requiredProp3' ] },
        edit: { include: [ 'id', 'requiredProp1', 'requiredProp2' ] },
        onlyId: { include: [ 'id' ] }        
      }
  }

   const myEntity = new FakeEntityWithIncludeContext({ id: 1 });

   const contextCreate = myEntity.validateContext('create');
   console.log(contextCreate.errors); // { requiredProp1: { errors: [ ... ] } }
   console.log(contextCreate.valid); // false

   const contextEdit = myEntity.validateContext('edit');
   console.log(contextEdit.errors); // { requiredProp1: { errors: [ ... ] }, requiredProp2: { errors: [ ... ] } }
   console.log(contextEdit.valid); // false

   const contextOnlyId = myEntity.validateContext('onlyId')
   console.log(contextOnlyId.errors); // {}
   console.log(contextOnlyId.valid); // true
```
  Each context (create and edit in example above), could have _include_ property OR  _exclude_, the _include_ property receives the properties that will be validated in this context,
  and the _exclude_ property represents the properties that will be ignored on validation.

  In the example, the create context, will only check the 'requiredProp1' and 'requiredProp2'  fields, and the edit context will check 'requiredProp1', 'requiredProp2'  and 'id' properties.

  You **can't** combine include and exclude in the same context definition

##Custom validation
  You can validate your entity adding the property in _fields_ and setting the new validator
  ```javascript
    class Entity extends Speck {
      static SCHEMA = {
        id: joiAdapter(Joi.number().required()),
        requiredProp1: joiAdapter(Joi.number().required())
      }

      static CONTEXTS = {
        create: {
          fields: {
            requiredProp1: (obj, field) => {
              if(obj[field] === -1) return new Error('Error -1');
            }
          }
        }
      }
    }

    const entity = new Entity({
      id: 1,
      requiredProp1: -1
    });

    const contextValidated = entity.validateContext('create');
    console.log(entity.errors.requiredProp1); // undefined
    console.log(contextValidated.requiredProp1); // { errors: [Error: Error -1] }
  ```

  ### Hooks
  ```javascript
  class EntityWithHook extends Speck {
      static SCHEMA = {
          fieldWithHook: {
            validator: joiAdapter(Joi.number()),
            hooks: {
              afterSet(data, fieldName) {
                // data is the whole data of the instance
                // fieldName the current fieldName
                // DO WHATEVER YOU WANT
              }
            }
          },
          anotherFieldWithHook: {
            validator: joiAdapter(Joi.number()),
            hooks: {
              afterSet(data, fieldName) {
                return { anotherField: data[fieldName] * 2 } // if the afterSet hook returns an object is merged to data
              }
            }
          },
          anotherField: joiAdapter(Joi.number()),
      }
  }

  const myEntity = new EntityWithHook({ fieldWithHook: 'foo', anotherFieldWithHook: 'bar', anotherField: null });

  myEntity.anotherFieldWithHook = 10 //according to the after set hook anotherField newValue will be 20
```
