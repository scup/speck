import { PropTypes } from 'react';

import Speck from '../../src/Speck';
import SpeckCollection from '../../src/SpeckCollection';
import { ProductEntity } from './fakerClasses';

class ProductEntityCollection extends SpeckCollection {
  getSortedItemsByName() {
    return this.sortBy('name');
  }
}

ProductEntityCollection.TYPE = ProductEntity;

class ChildWithChildArray extends Speck { }
ChildWithChildArray.SCHEMA = {
  name: PropTypes.string,
  children: {
      validator: PropTypes.arrayOf(PropTypes.instanceOf(ChildWithChildArray)),
      type: ChildWithChildArray
  }
};

Object.assign(exports, { ProductEntityCollection, ChildWithChildArray });
