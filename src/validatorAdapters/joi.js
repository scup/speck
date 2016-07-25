export const Adapter = (Joi) => {
  return function JoiValidatorAdapter(joiChain) {
    return function PropTypesValidator(props, propName) {
      const schema = Joi.object().keys({
        [propName]: joiChain
      });
      const result = Joi.validate({ [propName]: props[propName] }, schema);
      if (result.error) {
        return new Error(`Joi${result.error}`);
      }
    }
  };
};
