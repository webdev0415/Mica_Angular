import { TestBed, async } from '@angular/core/testing';
import * as _ from 'lodash';
import { HomeService } from './home.service';
import { NgRedux } from '@angular-redux/store';
import { defaultState } from '../../app.config';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import Data = Illness.Data;
const fakeTasks = require('../../../test/data/tasks.json').tasks;


describe('HomeService', () => {
  const state = _.cloneDeep(defaultState);
  const user = {
    name: 'User',
    roleName: 'Reviewer',
    userID: 123
  };
  const mockRedux = {
    getState: () => state,
    dispatch: () => {
    }
  };
  let service: HomeService;
  let redux: NgRedux<State.Root>;
  let mockBackend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HomeService,
        { provide: NgRedux, useValue: mockRedux }
      ],
      imports: [HttpClientTestingModule]
    });
  });
  beforeEach(async(() => {
    mockBackend = TestBed.get(HttpTestingController);
    service = TestBed.get(HomeService);
    redux = TestBed.get(NgRedux);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array if there is no user', () => {
    spyOn(redux, 'getState').and.returnValue({...state, user: {name: ''}});
    service.tasks$.subscribe((tasks) => {
      expect(tasks).toEqual([]);
    })
  });

  it('should return throw if the user is not valid', () => {
    spyOn(redux, 'getState').and.returnValue({...state, user: {name: 'Name'}});
    service.tasks$.subscribe(_, err => {
      expect(err).toBe('Missing user data');
    })
  });

  it('should return array of tasks', () => {
    spyOn(redux, 'getState').and.returnValue({...state, user});
    service.tasks$.subscribe(tasks => {
      expect(tasks[0]).toBeTruthy();
    });
    mockBackend.expectOne(() => true).flush({task: fakeTasks});
  });

  it('skipIllness should return error if there is no user', () => {
    const illness = fakeTasks[0].illness[0];
    spyOn(redux, 'getState').and.returnValue({});
    service.skipIllness(illness).subscribe(_, (err) => {
      expect(err).toBe('no user selected');
    })
  });

  it('skipIllness should return data', () => {
    const illness = fakeTasks[0].illness[0];
    const data = {success: 'true', ...illness};
    spyOn(redux, 'getState').and.returnValue({...state, user});
    service.skipIllness(illness).subscribe(res => {
      expect(res).toEqual(data);
    });
    mockBackend.expectOne(() => true).flush(data);
  });

  xit('skipIllness', () => {
    spyOn(redux, 'getState').and.returnValue({
      user: {
        roleName: ''
      }
    });
    const illness = {
      idIcd10Code: 'A',
      version: 1
    } as Data;
    spyOnProperty<any>(service, 'apiConfig', 'get').and.returnValue({root: ''});
    service.skipIllness(illness).subscribe(
      () => {},
      (err) => {
        expect(err.status).toEqual('')
      });
    mockBackend.expectOne(() => true).flush(false);
  });

});
