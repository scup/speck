const objectsByKey = (Type) => {
  return {
    type: Type,
    //TODO validate to use the schema of Type
    validator: () => undefined,
    builder: (data) => {
      return Object.keys(data).reduce((result, key) => {
        result[key] = new Type(data[key]);
        return result;
      },{})
    }
  }
};

export default objectsByKey;
