const { expect } = require('chai')

const objectsByKey = require('typeBuilders/objectsByKey')

const { ChildrenEntity } = require('../fixtures/fakerClasses')

describe('objectsByKey', () => {
  it('creates the type based on parameter', () => {
    const newType = objectsByKey(ChildrenEntity)

    expect(newType.type).to.equal(ChildrenEntity)
  })

  it('builds objects by its type', () => {
    const newType = objectsByKey(ChildrenEntity)

    const result = newType.builder({ sample: {}, other: {} })

    expect(result.sample.constructor).to.equal(ChildrenEntity)
    expect(result.other.constructor).to.equal(ChildrenEntity)
  })
})
