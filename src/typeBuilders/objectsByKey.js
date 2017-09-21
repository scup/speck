module.exports = function objectsByKey (Type) {
  return {
    type: Type,
    validator: Type.SCHEMA,
    builder (data) {
      function buildTypeWithDataForKeys (result, key) {
        return Object.assign({}, result, { [key]: new Type(data[key]) })
      }

      return Object.keys(data).reduce(buildTypeWithDataForKeys, {})
    }
  }
}
