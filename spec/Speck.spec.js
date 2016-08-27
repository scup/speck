import { expect } from 'chai';
import Faker from 'faker';
import Joi from 'joi';
import sinon from 'sinon';

import {Entity, Collection, validatorAdapter } from '../src/Speck';

import {
  defaultField,
  defaultValue,
  FakeEntityWithDefault,
  ProductEntity,
  ProductEntityCollection,
  Validatable,
  ChildrenEntity,
  FatherEntity,
  FatherWithObjectEntity,
  ChildWithChildArray,
  FakeEntityWithExcludeContext,
  FakeEntityWithIncludeContext,
  FakeEntityWithCustomValidationWithContext
} from './fixtures/fakerClasses';

describe('Speck', function (){
  it('should merge with default data', function (){
    const fakeEntity = new FakeEntityWithDefault();
    expect(fakeEntity[defaultField]).to.equal(defaultValue);
  });

  it('should clean data on fetch', function (){
    const fakeEntity = new FakeEntityWithDefault({
      fakeAttribute: 'should not come'
    });

    expect(fakeEntity.toJSON()).to.deep.equal({
      [defaultField]: defaultValue,
      [`_${defaultField}`]: `_${defaultValue}`
    });
  });

  it('should create set for property and call validate when change', function (){
    const fakeEntity = new FakeEntityWithDefault();
    sinon.spy(fakeEntity, '_validate');

    fakeEntity[`_${defaultField}`] = `_${defaultValue}`;
    sinon.assert.notCalled(fakeEntity._validate);

    fakeEntity[`_${defaultField}`] = defaultValue;
    sinon.assert.calledOnce(fakeEntity._validate);
  });

  it('should not use defaultValue when a value is passed', function (){
    const newValue = Faker.name.findName();
    const fakeEntity = new FakeEntityWithDefault({
      [defaultField]: newValue
    });

    expect(fakeEntity[`_${defaultField}`]).to.equal(`_${defaultValue}`);
    expect(fakeEntity[defaultField]).to.equal(newValue);
  });

  it('should validate when build', function (){
    // given
    sinon.spy(Validatable.SCHEMA, 'field');
    sinon.spy(Validatable.SCHEMA.otherField, 'validator');

    // when
    new Validatable({
      field: 'value',
      noField: 'should not go'
    });

    // then
    sinon.assert.calledWith(
      Validatable.SCHEMA.field,
      { field: 'value', otherField: 'bla' },
      'field',
      'ValidatableEntity'
    );
    sinon.assert.calledWith(
      Validatable.SCHEMA.otherField.validator,
      { field: 'value', otherField: 'bla' },
      'otherField',
      'ValidatableEntity'
    );
  });

  it('should auto validate', function (){
    // when
    const entity = new Validatable({ field: 'invalid', otherField: 'invalid'});

    expect(entity.valid).to.equal(false);
    entity.field = 'valid';

    expect(entity.valid).to.equal(false);
    entity.otherField = 'valid';
    expect(entity.valid).to.equal(true);
  });

  describe('children', function (){
    it('should auto build child entities of array', function (){
      const father = new FatherEntity({
        children: [
          {},
          {}
        ]
      });

      expect(father.children[0].constructor).to.equal(ChildrenEntity);
      expect(father.children[1].constructor).to.equal(ChildrenEntity);
    });

    it('should auto build using the parameter builder', () => {
      const father = new FatherWithObjectEntity({
        children: {
          content: { field: 'foo' },
          tweet: { field: 'bar' }
        }
      });

      expect(father.children.content.constructor).to.equal(ChildrenEntity);
      expect(father.children.tweet.constructor).to.equal(ChildrenEntity);
    });

    it('should include errors of children', function (){
      const father = new FatherEntity({
        foo: 'test',
        children: [{ foo: 'bar' }]
      });

      expect(father.getErrors()).to.deep.equal({ foo: { errors: [ 'foo accepts just \'bar\' as value' ] } });

      const lee = new ChildrenEntity({ foo: 'bar invalid '});
      father.children.push(lee);

      expect(father.getErrors()).to.deep.equal({
        foo: { errors: [ 'foo accepts just \'bar\' as value' ] },
        children: { 1: { foo: { errors: [ 'foo accepts just \'bar\' as value' ] } } }
      });
    });
  });


  describe('collection', function (){

    it('should return a collection of object', function (){

      const products = [
        {
          name: 'A',
          price: 10
        },
        {
          name: 'B',
          price: 2
        },
      ];

      const collection = new ProductEntityCollection(products);
      const results = collection.filter({name: 'A'}).result();

      expect(results[0].toJSON()).to.deep.equal({ name: 'A', price: 10 });
    });

    it('should return a collection similar with keyBy/lodash ', function (){
      const products = [
        {
          name: 'A',
          price: 1
        },
        {
          name: 'B',
          price: 2
        },
      ];

      const collection = new ProductEntityCollection(products);
      const product = collection
                        .filter({ name: 'B' })
                        .keyBy('name');

      expect(!!product.B).to.equal(true);
      expect(product.B.name).to.deep.equal(products[1].name);
      expect(product.B.price).to.deep.equal(products[1].price);
    });

    it('should return a collection ordered by name ', function (){

      const products = [
        {
          name: 'B'
        },
        {
          name: 'C',
          price: 2
        },
        {
          name: 'A'
        }
      ];

      const collection = new ProductEntityCollection(products);
      const results = collection.getSortedItemsByName().result();

      expect(results[0].toJSON()).to.deep.equal({ name: 'A'});
      expect(results[1].toJSON()).to.deep.equal({ name: 'B'});
      expect(results[2].toJSON()).to.deep.equal({ name: 'C', price: 2 });
    });

    it('concat a list with another list ', function (){

      const listA = [
        {
          name: 'AAA'
        }
      ];

      const listB = [
        {
          name: 'BBB'
        }
      ];

      const collection = new ProductEntityCollection(listA);
      const results = collection.concat(listB).result();
    });

    it('it should build itself along with childs which is of type itself', () => {
      const childWithChildArray = new ChildWithChildArray({
          name: 'Node1',
          children: [{
              name: 'Node1.1',
              children: [{
                  name: 'Node 1.1.1'
              }]
          }]
      });

      expect(childWithChildArray.constructor).to.equal(ChildWithChildArray);
      expect(childWithChildArray.children[0].constructor).to.equal(ChildWithChildArray);
    });
  });

  describe('Contextual validation', function (){

    it('it should set contexts excluded', () => {
      const fakeEntityWithContext = new FakeEntityWithExcludeContext({
        name: 'Node1'
      });

      const contextValidated = fakeEntityWithContext.validateContext('create');

      expect(fakeEntityWithContext.constructor).to.equal(FakeEntityWithExcludeContext);
      expect(contextValidated.id).to.be.undefined;
      expect(contextValidated.requiredProp1).not.to.be.undefined;
      expect(contextValidated.requiredProp2).not.to.be.undefined;
      expect(contextValidated.requiredProp3).to.be.undefined;
    });

    it('it should set contexts include', () => {
      const fakeEntityWithContext = new FakeEntityWithIncludeContext({
        name: 'Node1'
      });

      const contextValidated = fakeEntityWithContext.validateContext('create');

      expect(fakeEntityWithContext.constructor).to.equal(FakeEntityWithIncludeContext);
      expect(contextValidated.id).to.be.undefined;
      expect(contextValidated.requiredProp1).not.to.be.undefined;
      expect(contextValidated.requiredProp2).not.to.be.undefined;
      expect(contextValidated.requiredProp3).to.be.undefined;
    });

    it('it should set custom validations', () => {
      const fakeEntityWithContext = new FakeEntityWithCustomValidationWithContext({
        id: 1,
        requiredProp1: -1
      });

      const contextValidated = fakeEntityWithContext.validateContext('create');

      expect(fakeEntityWithContext.constructor).to.equal(FakeEntityWithCustomValidationWithContext);
      expect(contextValidated.id).to.be.undefined;

      expect(contextValidated.requiredProp1).not.to.be.undefined;
      expect(fakeEntityWithContext.errors.requiredProp1).to.be.undefined;

    });
  });

  describe('Joi Validator', function (){
    let myData,
        joiAdapter;

    beforeEach(() => {
      joiAdapter = validatorAdapter('joi', Joi);
      myData = {
        myStringProp: 'Some text',
        httpURLProp: 'http://mysite.com',
        httpsURLProp: 'https://mysite.com',
        ftpURLProp: 'ftp://myftp.com',
      };
    });

    it('should validate if value is equal string', () => {
      const myStringValidator = joiAdapter(Joi.string());
      expect(myStringValidator(myData, 'myStringProp')).to.be.undefined;
    });

    it('should validate if string have URL format', () => {
      const myURLValidator = joiAdapter( Joi.string().uri({ scheme: [
        'http',
        'https'
      ]}) );
      expect(myURLValidator(myData, 'httpURLProp')).to.be.undefined;
      expect(myURLValidator(myData, 'httpsURLProp')).to.be.undefined;
      const expectedMsg = 'JoiValidationError: child "ftpURLProp" fails '+
                          'because ["ftpURLProp" must be a valid uri with a '+
                          'scheme matching the http|https pattern]';
      expect(myURLValidator(myData, 'ftpURLProp').message).to.equal(expectedMsg);
    })
  });
});
