import { expect } from 'chai';
import Faker from 'faker';
import sinon from 'sinon';

import Speck from '../src/Speck';

import {
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
} from './fixtures/fakerClasses';

describe('Speck', () => {
  it('merges with default data', () => {
    const fakeEntity = new FakeEntityWithDefault();
    expect(fakeEntity[defaultField]).to.equal(defaultValue);
  });

  it('cleans data on fetch', () => {
    const fakeEntity = new FakeEntityWithDefault({
      fakeAttribute: 'should not come'
    });

    expect(fakeEntity.fetch()).to.deep.equal({
      [defaultField]: defaultValue,
      [`_${defaultField}`]: `_${defaultValue}`
    });
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
        children: [{ foo: '2bar' }],
        child: { foo: '2bar' }
      });

      expect(father.getErrors()).to.deep.equal({
        foo: { errors: [ 'foo accepts just \'bar\' as value' ] },
        child: {
          '0': { foo: { 'errors': [ 'foo accepts just \'bar\' as value' ] } }
        },
        children: {
          '0': { foo: { 'errors': [ 'foo accepts just \'bar\' as value' ] } }
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
  });
});
