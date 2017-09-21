const { ProductEntityCollection, ChildWithChildArray } = require('./fixtures/fakerCollections')
const { expect } = require('chai')

describe('SpeckCollection', function () {
  it('returns a collection of object', function () {
    const products = [
      {
        name: 'A',
        price: 10
      },
      {
        name: 'B',
        price: 2
      }
    ]

    const collection = new ProductEntityCollection(products)
    const results = collection.filter({name: 'A'}).result()

    expect(results[0].toJSON()).to.deep.equal({ name: 'A', price: 10 })
  })

  it('returns a POJO array from the collection', function () {
    const products = [
      {
        name: 'A',
        price: 10
      },
      {
        name: 'B',
        price: 2
      }
    ]

    const collection = new ProductEntityCollection(products)

    expect(JSON.stringify(collection.toJSON())).to.equal(JSON.stringify(products))
  })

  it('rebuild the collection based on the POJO array returned from the collection toJSON()', function () {
    const products = [
      {
        name: 'A',
        price: 10
      },
      {
        name: 'B',
        price: 2
      }
    ]

    const collection = new ProductEntityCollection(products)
    const collectionJSON = collection.toJSON()
    const collection2 = new ProductEntityCollection(collectionJSON)

    expect(collection).to.deep.equal(collection2)
  })

  it('returns a collection similar with keyBy/lodash ', function () {
    const products = [
      {
        name: 'A',
        price: 1
      },
      {
        name: 'B',
        price: 2
      }
    ]

    const collection = new ProductEntityCollection(products)
    const product = collection
                      .filter({ name: 'B' })
                      .keyBy('name')

    expect(!!product.B).to.equal(true)
    expect(product.B.name).to.deep.equal(products[1].name)
    expect(product.B.price).to.deep.equal(products[1].price)
  })

  it('returns a collection ordered by name ', function () {
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
    ]

    const collection = new ProductEntityCollection(products)
    const results = collection.getSortedItemsByName().result()

    expect(results[0].toJSON()).to.deep.equal({ name: 'A' })
    expect(results[1].toJSON()).to.deep.equal({ name: 'B' })
    expect(results[2].toJSON()).to.deep.equal({ name: 'C', price: 2 })
  })

  it('concatenates a list with another list ', function () {
    const listA = [
      {
        name: 'AAA'
      }
    ]

    const listB = [
      {
        name: 'BBB'
      }
    ]

    const collection = new ProductEntityCollection(listA)
    collection.concat(listB).result()
  })

  it('builds itself along with childs which is of type itself', () => {
    const childWithChildArray = new ChildWithChildArray({
      name: 'Node1',
      children: [{
        name: 'Node1.1',
        children: [{
          name: 'Node 1.1.1'
        }]
      }]
    })

    expect(childWithChildArray.constructor).to.equal(ChildWithChildArray)
    expect(childWithChildArray.children[0].constructor).to.equal(ChildWithChildArray)
  })
})
