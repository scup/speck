import { clone, get, isNil, isFunction } from 'lodash';

const createGetterAndSetter = function (instance, field){
  return {
    set: function (value){
      if(instance.data[field] !== value) {
        instance.data[field] = value;
        return instance._validate();
      }
    },
    get: function (){ return instance.data[field]; },
    enumerable: true
  }
}

class Speck {
  constructor(data) {
    Object.defineProperty(this, 'schema', {
      value: this.constructor.SCHEMA,
      enumerable: false
    });

    Object.defineProperty(this, 'contexts', {
      value: this.constructor.CONTEXTS,
      enumerable: false
    });

    Object.defineProperty(this, 'childrenEntities', {
      value: Object.keys(this.constructor.SCHEMA).filter((field) => !!this.constructor.SCHEMA[field].type),
      enumerable: false
    });

    this.errors = {};
    Object.defineProperty(this, 'data', {
      value: this._mergeDefault(data || {}),
      enumerable: false
    });

    this._validate();
  }

  __initFieldValue(field, data) {
    const hasValue = !isNil(data[field]);

    if (hasValue) return data[field];

    const defaultValue = this.schema[field].defaultValue
    const isFunction = defaultValue instanceof Function;

    return isFunction ? defaultValue : clone(this.schema[field].defaultValue);
  }

  _mergeDefault(data) {
    const newData = {};
    let field;
    for(field in this.schema){
      newData[field] = this.__initFieldValue(field, data);

      if (this.schema[field].type || this.schema[field].builder) {
        newData[field] = this.applyEntityConstructor(this.schema[field], newData[field]);
      }

      Object.defineProperty(this, field, createGetterAndSetter(this, field));
    }
    return newData;
  }

  _fetchChild(fieldValue){
    if (Array.isArray(fieldValue)){
      return fieldValue.map(this._fetchChild)
    }

    if (fieldValue && typeof(fieldValue.toJSON) === 'function'){
      return fieldValue.toJSON();
    }

    return fieldValue;
  }

  __validateField(field) {
    const validator = typeof(this.schema[field]) === 'function' ?
                        this.schema[field] :
                        this.schema[field].validator;

    const error = validator(this.data, field, this.constructor.name + 'Entity');

    if (error) {
      this.errors[field] = { errors : [error.message || error] }
    }
  }

  _validate() {
    this.errors = {};

    let field;
    for(field in this.schema){
      this.__validateField(field);
    }
    this.valid = Object.keys(this.errors).length === 0;

    if(!this.valid) {
      return this.errors;
    }
  }

  _includeChildErrors(field, errors, entity, index) {
    if(!entity.valid) {
      if(errors[field] === undefined) { errors[field] = {} }

      errors[field][index] = entity.getErrors();
    }
    return errors;
  }

  _getChildrenErrors(errors, field) {
    const children = Array.isArray(this[field]) ? this[field] : [this[field]];

    return children.reduce(this._includeChildErrors.bind(this, field), errors);
  }

  applyEntityConstructor(field, data) {
    const Type = field.type;

    if(isFunction(field.builder)) {
      return field.builder(data, Type);
    }

    if (!data) return;

    if (Array.isArray(data)) {
      return data.map(instance => new Type(instance));
    }

    return new Type(data);
  }

  toJSON(){
    let rawData = Object
      .keys(this.data)
      .reduce((data, field) => {
        return Object.assign(data, { [field]: this._fetchChild(this.data[field]) })
      }, {});

    return JSON.parse(JSON.stringify(rawData));
  }

  getErrors() {
    const errors = Object.assign({}, this._validate());

    return this.childrenEntities.reduce(this._getChildrenErrors.bind(this), errors);
  }

  validateContext(context){
    if(!get(this.contexts, context)) return this.errors;

    let validation = () => true;
    if(this.contexts[context].exclude && Object.keys(this.contexts[context].exclude).length > 0){
      validation = (error)=>{
        return this.contexts[context].exclude.find(exclude => exclude === error) === undefined;
      };
    }

    if(this.contexts[context].include && Object.keys(this.contexts[context].include).length > 0){
      validation = (error)=>{
        return this.contexts[context].include.find(include => include === error) !== undefined;
      };
    }

    const contextErrors = Object.assign({}, this.errors);
    if(this.contexts[context].fields){
      Object.keys(this.contexts[context].fields).forEach((field) => {
        const result = this.contexts[context].fields[field](this, field, this.constructor.name);
        if(result) contextErrors[field] = {errors: result};
        else delete contextErrors[field];
      });
    }

    const errors = Object.keys(contextErrors).filter(validation);

    const contextValidation = errors.reduce((newError,errorField)=>{
      newError[errorField] = contextErrors[errorField];
      return newError;
    } , {});

    return Object.assign({ valid: !Object.keys(contextValidation).length }, contextValidation)
  }
}

export default Speck;
