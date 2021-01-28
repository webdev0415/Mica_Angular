import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import * as _ from 'lodash';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { TasksComponent } from './tasks.component';
import { TitleCasePipe } from '../../pipes/title-case.pipe';
import { ApiService } from '../../typeahead/api.service';
import { TypeaheadApiServiceStub } from '../../../../test/services-stubs/typeahead-api.service.stub';
import { IllnessService } from 'app/services';
import { IllnessServiceStub } from '../../../../test/services-stubs/illness.service.stub';
import { NgRedux } from '@angular-redux/store';
import { defaultState } from 'app/app.config';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeService } from '../home.service';
import { HomeServiceStub } from '../../../../test/services-stubs/home.service.stub';
import { TimeoutError } from 'rxjs/util/TimeoutError';
import { of } from 'rxjs/observable/of';
import RequestItem = MICA.API.UpdateIllnessState.RequestItem;
import FormValue = Illness.FormValue;
import Data = Task.Data;
import IllnessData = Illness.Data;
import * as userSelectors from 'app/state/user/user.selectors';
import * as workbenchSelectors from 'app/state/workbench/workbench.selectors';
import SelectableEl = MICA.SelectableEl;

const fakeTasks = require('../../../../test/data/tasks.json').tasks;
const fakeIllnesses = require('../../../../test/data/illnesses.json');
const state = _.cloneDeep(defaultState);

const mockRedux = {
  getState: (): State.Root => {
    return _.cloneDeep(state)
  },
  select: (selector) => of(selector(state)),
  dispatch: (arg: any) => {
  }
};

@Component({
  selector: 'mica-task-includes',
  template: '<div></div>'
})
class MockTaskIncludesComponent {
  @Input() readonly task: Task.Data;
  @Output() skipIllness: EventEmitter<[Illness.Data, Event]> = new EventEmitter();
  @Output() reviewerIllnessMissing: EventEmitter<string[]> = new EventEmitter();
  @Input() syncedIllnesses: null | MICA.User.IllnessesByState;
  @Input() removeEnabled: boolean;
}

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let illnessService: IllnessServiceStub;
  let redux: NgRedux<State.Root>;
  let apiService: ApiService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TasksComponent,
        MockTaskIncludesComponent,
        TitleCasePipe
      ],
      providers: [
        { provide: IllnessService, useClass: IllnessServiceStub },
        { provide: HomeService, useClass: HomeServiceStub },
        { provide: NgRedux, useValue: mockRedux },
        { provide: ApiService, useClass: TypeaheadApiServiceStub }
      ],
      imports: [
        BrowserAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksComponent);
    redux = TestBed.get(NgRedux);
    component = fixture.componentInstance;
    component.tasks = fakeTasks;
    component.tasksOriginal = fakeTasks;
    component.disabledAccordion = false;
    component.title = 'title';
    // spyOn(component as any, "getGroupedIllnessesByState").and.callFake((states: string[]) => {
    //   const illness = fakeIllnesses[0];
    //   const fakeValue = {};
    //   fakeValue[illness.form.state] = [illness.form];
    //   return of(fakeValue);
    // });
    fixture.detectChanges();
    illnessService = TestBed.get(IllnessService);
    apiService = TestBed.get(ApiService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onReviewerIllnessMissing', () => {
    const task = fakeTasks[0];
    const illnessData = task.illness[0];
    const illness = fakeIllnesses[0];
    const updatedData = {
      status: 'OK',
      count: 1,
      idIcd10Codes: [illness.idIcd10Code]
    };
    const spyUpdateIllStatus = spyOn(illnessService, 'updateIllStatus');
    const spyGetUserIllnessSavedByState = spyOn(illnessService, 'getUserIllnessSavedByState');

    (state.user as any).userID = 1;
    illness.form = {...illness.form, name: illnessData.name, idIcd10Code: illnessData.idIcd10Code};

    spyUpdateIllStatus.and.returnValue(of(updatedData));
    spyGetUserIllnessSavedByState.and.returnValue(of([illness.form]));

    component.onReviewerIllnessMissing([illness], task);
    expect(component.syncedIllnesses[illness.form.state][0]).toEqual(illness.form);

    (state.user as any).userID = -1;
    expect(() => component.onReviewerIllnessMissing([illness], task)).toThrow(jasmine.any(Error));
  });

  it('expand', () => {
    component['activePanels'] = [17];
    const evt = new Event('click');
    const evtSpy = spyOn(evt, 'preventDefault');
    component['expand'](17, evt);
    expect(component['activePanels']).toEqual([]);
    expect(evtSpy).toHaveBeenCalled();
  });

  it('expand', () => {
    component['activePanels'] = [];
    const evt = new Event('click');
    const evtSpy = spyOn(evt, 'preventDefault');
    component['expand'](17, evt);
    expect(component['activePanels']).toEqual([17]);
    expect(evtSpy).toHaveBeenCalled();
  });

  xit('updateIllStatus', () => {
    expect(illnessService.updateIllStatus([{icd10Code: '17'} as RequestItem])).toEqual(of({
      status: 'OK',
      count: 1,
      idIcd10Codes: ['17']
    }));
  });

  it('getUserIllnessSavedByState', () => {
    illnessService.getUserIllnessSavedByState(['PENDING', 'COMPLETE']).subscribe(val => expect(val).toEqual(
      [fakeIllnesses[0].form]
    ));
  });

  it('onReviewerIllnessMissing', () => {
    expect(() => component.onReviewerIllnessMissing([], {taskId: -1} as Data)).toThrow();
  });

  it('searchIllnessByID', () => {
    spyOn(apiService, 'search').and.returnValue(of([]));
    component.searchIllnessByID('17').subscribe(val => expect(val).toBeNull());
  });

  it('onSkipIllness', () => {
    const s = {...defaultState};
    Object.assign(s, {user: {roleID: -2}});
    spyOnProperty<any>(component, 'state', 'get').and.returnValue(s);
    const mockDispatch = spyOn(redux, 'dispatch').and.callThrough();
    const eventData = [{}, {stopPropagation: () => {}}] as any;
    component['onSkipIllness'](eventData);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('onSkipIllness', () => {
    const s = { ...defaultState, user: { roleID: 2 } };
    const mockDispatch = spyOn(redux, 'dispatch').and.callThrough();
    const eventData = [{}, { stopPropagation: () => {} }] as any;

    spyOnProperty<any>(component, 'state', 'get').and.returnValue(s);
    component['onSkipIllness'](eventData);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('upsertIllness', () => {
    const mockDispatch = spyOn(redux, 'dispatch').and.callThrough();
    const tasks = [
      {
        illness: [
          {
            version: 1,
            idIcd10Code: '1'
          }
        ]
      } as Data
    ];
    const data = [
      {
        version: 1,
        idIcd10Code: '1'
      } as FormValue,
      {
        version: 2,
        idIcd10Code: '1'
      } as FormValue
    ];
    component.tasks = tasks;
    component['upsertIllness'](data);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('processOrphanedIllnesses', () => {
    const data = {
      'state': []
    };
    const s = {...defaultState};
    Object.assign(s, {user: {roleID: -2}});
    spyOnProperty<any>(component, 'state', 'get').and.returnValue(s);
    expect(component['processOrphanedIllnesses'](data)).toBeUndefined();
  });

  it('processOrphanedIllnesses', () => {
    const tasks = [
      {
        illness: [
          {
            version: 1,
            idIcd10Code: '1'
          }
        ]
      } as Data
    ];
    const data = {
      'READY-FOR-REVIEW': [
        {
          version: 1,
          idIcd10Code: '2'
        } as FormValue
      ]
    };
    component.tasks = tasks;
    component['activePanels'] = [];
    const s = {...defaultState};
    Object.assign(s, {user: {roleID: 2}});
    spyOnProperty<any>(component, 'state', 'get').and.returnValue(s);
    const mockDispatch = spyOn(redux, 'dispatch').and.callThrough();
    component['processOrphanedIllnesses'](data);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('processOrphanedIllnesses', () => {
    const tasks = [
      {
        illness: [
          {
            version: 1,
            idIcd10Code: '1'
          }
        ]
      } as Data
    ];
    const data = {
      'READY-FOR-REVIEW': [
        {
          version: 1,
          idIcd10Code: '1'
        } as FormValue
      ]
    };
    component.tasks = tasks;
    const s = {...defaultState};
    Object.assign(s, {user: {roleID: 2}});
    spyOnProperty<any>(component, 'state', 'get').and.returnValue(s);
    const mockDispatch = spyOn(redux, 'dispatch').and.callThrough();
    component['processOrphanedIllnesses'](data);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('processOrphanedIllnesses', () => {
    const tasks = [
      {
        illness: [
          {
            version: 1,
            idIcd10Code: '1'
          }
        ]
      } as Data
    ];
    const data = {
      'READY-FOR-REVIEW': [
        {
          version: 1,
          idIcd10Code: '2'
        } as FormValue
      ]
    };
    component.tasks = tasks;
    const s = {...defaultState};
    component['activePanels'] = [1];
    Object.assign(s, {user: {roleID: 2}});
    spyOnProperty<any>(component, 'state', 'get').and.returnValue(s);
    const mockDispatch = spyOn(redux, 'dispatch').and.callThrough();
    component['processOrphanedIllnesses'](data);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('searchIllnessByID', () => {
    const approved = 'APPROVED';
    const illnesses = [
      {
        value: {
          state: approved,
          version: 1
        }
      }
    ];
    spyOn(apiService, 'search').and.returnValue(of(illnesses));
    component.searchIllnessByID('17').subscribe(val => expect(val).toEqual(illnesses[0]));
  });

  it('searchIllnessByID', () => {
    const complete = 'COMPLETE';
    const illnesses = [
      {
        value: {
          state: complete,
          version: 1
        }
      }
    ];
    spyOn(apiService, 'search').and.returnValue(of(illnesses));
    component.searchIllnessByID('17').subscribe(val => expect(val).toBeNull());
  });

  it('ngOnInit', () => {
    component.disabledAccordion = true;
    expect(component.ngOnInit()).toBeUndefined();
  });

  it('ngOnInit', () => {
    const taskId = 17;
    const s = {...defaultState, workbench: { illnesses: { activeTaskId: taskId }}};
    const pushSpy = spyOn(component['activePanels'], 'push').and.callFake(() => {});

    spyOnProperty<any>(component, 'state', 'get').and.returnValue(s);
    spyOn(component, 'checkPreviousVersion').and.returnValue(of(null));
    component.tasks = [
      <Data>{ taskId }
    ];
    component.ngOnInit();
    expect(pushSpy).toHaveBeenCalled();
  });

  it('ngOnInit', () => {
    const taskId = 17;
    const s = {...defaultState, workbench: { illnesses: { activeTaskId: 18 }}};
    const pushSpy = spyOn(component['activePanels'], 'push').and.callFake(() => {});

    spyOn(component, 'checkPreviousVersion').and.returnValue(of(null));
    spyOnProperty<any>(component, 'state', 'get').and.returnValue(s);
    component.tasks = [
      <Data>{ taskId }
    ];
    component.ngOnInit();
    expect(pushSpy).toHaveBeenCalled();
  });

  it('ngOnInit', () => {
    const s = {
      ...defaultState,
      task: {
        checkedPreviousVersion: true
      },
      workbench: {
        illnesses: {
          activeTaskId: null
        }
      }
    };
    const checkPreviousVersionSpy = spyOn(component, 'checkPreviousVersion').and.callThrough();

    spyOnProperty<any>(component, 'state', 'get').and.returnValue(s);
    spyOn(userSelectors, 'isReviewer').and.returnValue(true);
    component.disabledAccordion = false;
    component.tasks = [];
    component.ngOnInit();
    expect(checkPreviousVersionSpy).not.toHaveBeenCalled();
  });

  it('groupByState', () => {
    const dataState = 'PENDING';
    const data = [
      {
        state: dataState
      } as FormValue,
      {
        state: dataState
      } as FormValue
    ];
    expect(component['groupByState'](data)[dataState].length).toEqual(data.length);
  });

  it('sortByDesc', () => {
    const el1 = {
      value: {
        version: 1
      }
    } as SelectableEl;
    const el2 = {
      value: {
        version: 2
      }
    } as SelectableEl;
    expect(component['sortByDesc'](el1, el2)).toEqual(1);
  });

  it('checkPreviousVersion', () => {
    const onAllResultsSpy = spyOn<any>(component, 'onAllResults').and.callThrough();
    const task = {
      illness: [
        { version: 2 }
      ]
    };

    spyOn(workbenchSelectors, 'illnessValue').and.returnValue(() => false);
    component.tasks = [<Data>task];
    component.checkPreviousVersion().subscribe(() => {});
    expect(onAllResultsSpy).toHaveBeenCalled();
  });

  it('onAllResults', () => {
    const illnesses = [
      {
        version: 1
      } as IllnessData
    ];
    const prevIllnesses = [
      {
        value: {
          idIcd10Code: 'code'
        },
      } as SelectableEl
    ];
    const dispatchSpy = spyOn(redux, 'dispatch').and.callThrough();
    component['illnesses'] = illnesses;
    component['onAllResults'](prevIllnesses);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('getGroupedIllnessesByState', () => {
    spyOn(component['illnessSvc'], 'getUserIllnessSavedByState').and.callFake(() => of({}));
    component['getGroupedIllnessesByState'](['PENDING']).subscribe(val => {
      expect(val).toEqual({});
    })
  });

});
