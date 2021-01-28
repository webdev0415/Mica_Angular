import { WebStorage } from './web.storage';
import { defaultState } from '../app.config';
import rootReducer from './root.reducer';

const storage = new WebStorage('key');

describe('web storage', () => {
  it('load', () => {
    spyOn(storage['storageArea'], 'getItem').and.returnValue(JSON.stringify(defaultState));
    expect(storage.load()).toEqual(defaultState);
  });

  it('load null', () => {
    spyOn(storage['storageArea'], 'getItem').and.returnValue(null);
    expect(storage.load()).toBe(defaultState);
  });

  it('save', () => {
    const removeItemSpy = spyOn(storage['storageArea'], 'removeItem').and.returnValue('');
    storage.save(undefined);
    expect(removeItemSpy).toHaveBeenCalled();
  });

  it('persistState reset', () => {
    const clearSpy = spyOn(storage, 'clear').and.callThrough();
    storage.persistState(rootReducer)({...defaultState}, {type: 'RESET_STATE'});
    expect(clearSpy).toHaveBeenCalled();
  });

  it('persistState dafault', () => {
    const saveSpy = spyOn(storage, 'save').and.callThrough();
    storage.persistState(rootReducer)({...defaultState}, {type: 'Default'});
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('save', () => {
    const obj = {};
    obj['a'] = {
      b: obj
    };
    storage.save(obj)
      .catch((e) => {
        expect(e).toBeDefined();
      });
  });
});
