import { expect } from 'chai';
import Faker from 'faker';
import sinon from 'sinon';

import Speck from '../src/Speck';

import {
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
} from './fixtures/fakerClasses';

describe('Speck', () => {
  it ('validates Boolean True context', () => {
    const instance = new FakeEntityWithBoolean({
      isDefault: true
    });
    expect(instance.isDefault).to.equal(true);
  });

  it ('validates Boolean False context', () => {
    const instance = new FakeEntityWithBoolean({
      isDefault: false
    });
    expect(instance.isDefault).to.equal(false);
  });

  describe('defaultValue', () => {
    it ('does not change default value of field', () => {
      const instance1 = new FakeEntityWithObject();
      instance1.config.name = 'Speck';
      const instance2 = new FakeEntityWithObject();
      expect(instance2.config).to.not.have.property('name');
      expect(instance1.config).to.not.equal(instance2.config);
    });

    it('merges with default data', () => {
      const fakeEntity = new FakeEntityWithDefault();
      expect(fakeEntity[defaultField]).to.equal(defaultValue);
    });

    it('cleans data on toJSON', () => {
      const fakeEntity = new FakeEntityWithDefault({
        fakeAttribute: 'should not come',
        children: [{ foo: 'bar' }],
        child: { foo: 'bar' }
      });

      expect(fakeEntity.toJSON()).to.deep.equal({
        [defaultField]: defaultValue,
        [`_${defaultField}`]: `_${defaultValue}`,
        child: { foo: 'bar' },
        children: [{ foo: 'bar' }]
      });
    });

    it('creates set for property and call validate when change', () => {
      const fakeEntity = new FakeEntityWithDefault();
      sinon.spy(fakeEntity, '_validate');

      fakeEntity[`_${defaultField}`] = `_${defaultValue}`;
      sinon.assert.notCalled(fakeEntity._validate);

      fakeEntity[`_${defaultField}`] = defaultValue;
      sinon.assert.calledOnce(fakeEntity._validate);
    });

    it('does not use defaultValue when a value is passed', () => {
      const newValue = Faker.name.findName();
      const fakeEntity = new FakeEntityWithDefault({
        [defaultField]: newValue
      });

      expect(fakeEntity[`_${defaultField}`]).to.equal(`_${defaultValue}`);
      expect(fakeEntity[defaultField]).to.equal(newValue);
    });

    it('does not hava default functions as objects', () => {
      const fakeEntity = new FakeEntityWithDefault();
      const fakeEntity2 = new FakeEntityWithDefault();

      expect(fakeEntity.functionAsDefault).to.be.instanceOf(Function);
      expect(fakeEntity.functionAsDefault).to.not.equal(fakeEntity2.functionAsDefault);
    });
  });

  it('validates when build', () => {
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

  it('validates automatically', () => {
    // when
    const entity = new Validatable({ field: 'invalid', otherField: 'invalid'});

    expect(entity.valid).to.equal(false);
    entity.field = 'valid';

    expect(entity.valid).to.equal(false);
    entity.otherField = 'valid';
    expect(entity.valid).to.equal(true);
  });

  describe('children', () => {
    it('builds Hetrogenerous types in a list automatically', () => {
      const elementEntity = new FakeEntityWithCustomElementList({
        elements: [{
          type: 'product',
          name: true,
          price:  true
        }, {
          type: 'default',
          isDefault: true
        }]
      });

      expect(elementEntity.elements[0].constructor).to.equal(ProductEntity);
      expect(elementEntity.elements[1].constructor).to.equal(FakeEntityWithBoolean);
    });

    it('builds automatically child entities of array', () => {
      const father = new FatherEntity({
        children: [
          {},
          {}
        ]
      });

      expect(father.children[0].constructor).to.equal(ChildrenEntity);
      expect(father.children[1].constructor).to.equal(ChildrenEntity);
    });

    it('builds automatically using the parameter builder', () => {
      const father = new FatherWithObjectEntity({
        children: {
          content: { field: 'foo' },
          tweet: { field: 'bar' }
        }
      });

      expect(father.children.content.constructor).to.equal(ChildrenEntity);
      expect(father.children.tweet.constructor).to.equal(ChildrenEntity);
    });

    it('includes errors of children', () => {
      const father = new FatherEntity({
        foo: 'test',
        children: [{ foo: '2bar' }, { foo: 'bar' }, { foo: '2bar' }],
        child: { foo: '2bar' }
      });

      expect(father.getErrors()).to.deep.equal({
        foo: { errors: [ 'foo accepts just \'bar\' as value' ] },
        child: {
          '0': { foo: { 'errors': [ 'foo accepts just \'bar\' as value' ] } }
        },
        children: {
          '0': { foo: { 'errors': [ 'foo accepts just \'bar\' as value' ] } },
          '2': { foo: { 'errors': [ 'foo accepts just \'bar\' as value' ] } }
        }
      });
    });
  });

  describe('validateContext', () => {
    it('sets contexts excluded', () => {
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

    it('sets contexts include', () => {
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

    it('sets custom validations', () => {
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

    it('returns the errors when then context does not exist', () => {
      const entity = new ProductEntity({ foo: 'bar' });
      const errors = entity.validateContext('noValidContext');

      expect(errors).to.deep.equal(entity.getErrors());
    });
  });
});
