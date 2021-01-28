import * as _ from 'lodash';
import { TestBed, inject } from '@angular/core/testing';
import { RequiredDataService } from './required-data.service';
import {NgRedux} from "@angular-redux/store";
import {defaultState} from "../../../app.config";
import {Router} from "@angular/router";
import * as workbenchSelectors from "../../../state/workbench/workbench.selectors";
const fakeIllnesses = require('../../../../test/data/illnesses.json');
const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: (): State.Root => {
    return state
  },
  dispatch: (arg: any) => {}
};

const mockRouter = {
  navigate: () => {}
};

describe('RequiredDataService', () => {
  let service: RequiredDataService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RequiredDataService,
        { provide: NgRedux, useValue: mockRedux },
        { provide: Router, useValue: mockRouter }
      ]
    });
    service = TestBed.get(RequiredDataService);
    router = TestBed.get(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('method hasActiveIllness', () => {
    const mockNavigate = spyOn(router, 'navigate').and.callFake(() => {});
    spyOn(workbenchSelectors, 'activeIllnessValue').and.returnValue(null);
    service.hasActiveIllness();
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('method hasActiveIllness', () => {
    const mockNavigate = spyOn(router, 'navigate').and.callFake(() => {});
    spyOn(workbenchSelectors, 'activeIllnessValue').and.returnValue(fakeIllnesses[0]);
    service.hasActiveIllness();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
