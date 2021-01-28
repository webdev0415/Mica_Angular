import * as _ from 'lodash';
import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import { NgRedux } from '@angular-redux/store';
import { MockBackend } from '@angular/http/testing';
import { defaultState } from '../../../app.config';
import { of } from 'rxjs/observable/of';
import * as workbenchSelectors from '../../../state/workbench/workbench.selectors';

const state = _.cloneDeep(defaultState);
const mockRedux = {
  getState: (): State.Root => state,
  select: (selector) => {
    return of(selector(state));
  },
  dispatch: (arg: any) => {
  }
};

describe('DataService', () => {
  let service: DataService;
  let mockBackend: MockBackend;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DataService,
        MockBackend,
        { provide: NgRedux, useValue: mockRedux }
      ]
    });
    service = TestBed.get(DataService);
    mockBackend = TestBed.get(MockBackend);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should create', () => {
    const name = 'name';
    const idx = 1;
    let result: any;
    service.isActiveDescriptor$(name, idx).subscribe(res => {
      result = res;
    })
  });

  it('isActiveDescriptor', () => {
    const descriptors = {
      'illness': {
        'symptom': [1, 2, 3]
      }
    };
    spyOn<any>(workbenchSelectors, 'activeIllnessID').and.returnValue('illness');
    spyOnProperty(service, 'activeDescriptors$', 'get').and.returnValue(of(descriptors));
    service.isActiveDescriptor$('symptom', 1).subscribe(val => expect(val).toBeTruthy());
  });
});
