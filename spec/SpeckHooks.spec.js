const Speck = require('Speck')
const { noop } = require('lodash')
const { expect } = require('chai')
const { mock, assert } = require('sinon')

describe('SpeckHooks', function () {
  beforeEach(function () {
    class MyEntitiesWithHooks extends Speck {}
    const afterSetMock = mock('afterSetHook')
    
    MyEntitiesWithHooks.SCHEMA = {
      anyField: noop,
      fieldWithHook: {
        validator: noop,
        hooks: {
          afterSet: afterSetMock
        }
      }
    }
    
    this.MyEntitiesWithHooks = MyEntitiesWithHooks
    this.afterSetMock = afterSetMock
  })
  
  it('calls the hook afterSet after set happens', function () {
    const data = { fieldWithHook: 'bla', anyField: 'foo' }
    const instance = new this.MyEntitiesWithHooks(data)
    instance.fieldWithHook = 'newValue'
    
    assert.calledWithExactly(this.afterSetMock, { fieldWithHook: 'newValue', anyField: 'foo' }, 'fieldWithHook')
  })
  
  it('assigns result of afterSet to data', function () {
    const data = { fieldWithHook: 'bla', anyField: 'foo' }
    const instance = new this.MyEntitiesWithHooks(data)
    
    const newData = { fieldWithHook: 'valueChanged', anyField: 'valueChanged' }
    this.afterSetMock
      .withExactArgs({ fieldWithHook: 'newValueToAssign', anyField: 'foo' }, 'fieldWithHook')
      .returns(newData)
      
    instance.fieldWithHook = 'newValueToAssign'
    
    expect(instance.data).to.deep.equal(newData)
  })
  
  it('does not assign result of afterSet to data when it not object', function () {
    const data = { fieldWithHook: 'bla', anyField: 'foo' }
    const instance = new this.MyEntitiesWithHooks(data)
    
    const newData = { fieldWithHook: 'valueChanged', anyField: 'valueChanged' }
    this.afterSetMock
      .withExactArgs({ fieldWithHook: 'newValueToAssign', anyField: 'foo' }, 'fieldWithHook')
      .returns('not object')
      
    instance.fieldWithHook = 'newValueToAssign'
    
    expect(instance.data).to.deep.equal({ fieldWithHook: 'newValueToAssign', anyField: 'foo' })
  })
})