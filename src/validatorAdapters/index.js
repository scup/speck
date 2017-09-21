const adapters = new Map()

module.exports = function validatorAdapter (adapterName, validatorClass) {
  const adapter = adapters.get(validatorClass)

  if (adapter) return adapter

  const newAdapter = require(`./${adapterName}`).Adapter(validatorClass)
  adapters.set(validatorClass, newAdapter)
  return newAdapter
}
