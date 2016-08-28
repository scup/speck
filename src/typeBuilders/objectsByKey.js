const objectsByKey = (Type) => {
  return {
    type: Type,
    validator: Type.SCHEMA,
    builder: (data) => {
      return Object.keys(data).reduce((result, key) => {
        result[key] = new Type(data[key]);
        return result;
      },{})
    }
  }
};

export default objectsByKey;
