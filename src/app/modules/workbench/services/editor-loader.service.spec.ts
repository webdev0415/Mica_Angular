import { TestBed, inject } from '@angular/core/testing';

import { EditorLoaderService } from './editor-loader.service';
import {NgRedux} from "@angular-redux/store";
import {Router} from "@angular/router";
import * as workbenchSelectors from "../../../state/workbench/workbench.selectors";

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};
const mockRedux = {
  dispatch: (arg: any) => {
  },
  getState: () => {}
};

describe('EditorLoaderService', () => {
  let redux: NgRedux<State.Root>;
  let service: EditorLoaderService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EditorLoaderService,
        {provide: NgRedux, useValue: mockRedux },
        { provide: Router, useValue: mockRouter },
      ]
    });
    redux = TestBed.get(NgRedux);
    service = TestBed.get(EditorLoaderService);
  });

  it('should be created',() => {
    expect(service).toBeTruthy();
  });

  it("dispatchSymptomGroup", () => {
    spyOn(workbenchSelectors, "activeIllnessID").and.returnValue(true);
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    service.dispatchSymptomGroup("17");
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("dispatchSymptomGroup", () => {
    spyOn(workbenchSelectors, "activeIllnessID").and.returnValue(false);
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    service.dispatchSymptomGroup("17");
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
