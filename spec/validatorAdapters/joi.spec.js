const { expect } = require('chai')
const Joi = require('joi')

const validatorAdapter = require('validatorAdapters')

describe('Joi', function () {
  let myData, joiAdapter

  beforeEach(() => {
    joiAdapter = validatorAdapter('joi', Joi)
    myData = {
      myStringProp: 'Some text',
      httpURLProp: 'http://mysite.com',
      httpsURLProp: 'https://mysite.com',
      ftpURLProp: 'ftp://myftp.com'
    }
  })

  it('validates if value is equal string', () => {
    const myStringValidator = joiAdapter(Joi.string())
    expect(myStringValidator(myData, 'myStringProp')).to.equal(undefined)
  })

  it('validates if string have URL format', () => {
    const myURLValidator = joiAdapter(Joi.string().uri({ scheme: [
      'http',
      'https'
    ]}))
    expect(myURLValidator(myData, 'httpURLProp')).to.equal(undefined)
    expect(myURLValidator(myData, 'httpsURLProp')).to.equal(undefined)
    const expectedMsg = 'JoiValidationError: child "ftpURLProp" fails ' +
                        'because ["ftpURLProp" must be a valid uri with a ' +
                        'scheme matching the http|https pattern]'
    expect(myURLValidator(myData, 'ftpURLProp').message).to.equal(expectedMsg)
  })
})
