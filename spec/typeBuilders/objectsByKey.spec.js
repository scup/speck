import objectsByKey from '../../src/typeBuilders/objectsByKey';

import { ChildrenEntity, ProductEntity } from '../fixtures/fakerClasses';

describe('objectsByKey', () => {
  it('should create the type based on parameter', () => {
    const newType = objectsByKey(ChildrenEntity);

    expect(newType.type).toBe(ChildrenEntity);
  });

  it('should build objects by its type', () => {
    const newType = objectsByKey(ChildrenEntity);

    const result = newType.builder({ sample: {}, other: {} });

    expect(result.sample.constructor).toBe(ChildrenEntity);
    expect(result.other.constructor).toBe(ChildrenEntity);
  });
});
