import Speck from './Speck.js';

import SpeckValidatorAdapters from './validatorAdapters';
import SpeckCollection from './SpeckCollection';
import objectsByKey from './typeBuilders/objectsByKey';

Object.assign(Speck, {
  Types: { objectsByKey },
  Collection: SpeckCollection,
  validatorAdapter: SpeckValidatorAdapters
});

export const Entity = Speck;
export const Types =  Speck.Types;
export const Collection = Speck.Collection;
export const validatorAdapter = Speck.validatorAdapter;

export default Speck;
