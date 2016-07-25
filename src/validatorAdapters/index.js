export default (adapterName, validatorClass) => {
  return require(`./${adapterName}`).Adapter(validatorClass);
}
