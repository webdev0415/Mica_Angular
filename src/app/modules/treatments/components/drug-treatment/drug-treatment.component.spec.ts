import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatIconModule, MatTooltipModule } from '@angular/material';

import { DrugTreatmentComponent } from './drug-treatment.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TreatmentsApiService } from '../../services/treatments-api.service';
import { TreatmentApiServiceStub } from '../../../../../test/services-stubs/treatment-api-service-stub.service';
import { NgRedux } from '@angular-redux/store';
import * as _ from 'lodash';
import { defaultState } from 'app/app.config';
import { of } from 'rxjs';
import * as treatmentsActions from '../../state/treatments.actions';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { MicaTestModule } from '../../../../../test/mica-test.module';

const mockRedux = {
  getState: (): State.Root => {
    return _.cloneDeep(defaultState)
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

describe('DrugTreatmentComponent', () => {
  let component: DrugTreatmentComponent;
  let fixture: ComponentFixture<DrugTreatmentComponent>;
  let store: MockStore<any>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatTooltipModule,
        MatIconModule,
        MatDialogModule,
        DragDropModule,
        FormsModule,
        ReactiveFormsModule,
        MicaTestModule
      ],
      declarations: [
        DrugTreatmentComponent,
      ],
      providers: [
        provideMockStore({ initialState: defaultState }),
        { provide: TreatmentsApiService, useClass: TreatmentApiServiceStub },
        { provide: NgRedux, useValue: mockRedux }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(MockStore);
    fixture = TestBed.createComponent(DrugTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle drug-n-drop (drop)', () => {
    const deleteDrugSpy = spyOn(<any>component, 'deleteDrug').and.callFake(() => {});
    const updateTreatmentsSpy = spyOn(<any>component, 'updateTreatments').and.callFake(() => {});
    const event: any = {
      isPointerOverContainer: true,
      previousContainer: { id: 'test' },
      container: { id: 'test' },
      previousIndex: 0,
      currentIndex: 1
    };

    event.container.data = [ { drugName: 'a' }, { drugName: 'b' } ];
    component.drop(<any>event, 0);
    expect(deleteDrugSpy).not.toHaveBeenCalled();
    expect(event.container.data[0].drugName).toEqual('b');
    expect(updateTreatmentsSpy).toHaveBeenCalled();

    event.isPointerOverContainer = false;
    event.previousContainer.id = 'double_test';
    event.previousContainer.data = [ { drugName: 'c' } ];
    event.currentIndex = 0;
    component.drop(<any>event, 0);
    expect(deleteDrugSpy).toHaveBeenCalled();
    expect(event.container.data[0].drugName).toEqual('c');
  });

  it('should delete drug (deleteDrug)', () => {
    const dispatchSpy = spyOn(store, 'dispatch').and.callFake(() => {});

    (<any>component).deleteDrug(0, 0);
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should delete group (deleteGroup)', () => {
    const updateTreatmentsSpy = spyOn(<any>component, 'updateTreatments').and.callFake(() => {});

    (<any>component).groups = [ { groupName: 'a' } ];
    component.deleteGroup(0);

    expect(updateTreatmentsSpy).toHaveBeenCalled();
    expect(updateTreatmentsSpy.calls.mostRecent().args[0].length).toEqual(0);
  });

  it('should save changes (saveChanges)', () => {
    const updateTreatmentsSpy = spyOn(<any>component, 'updateTreatments').and.callFake(() => {});

    (<any>component).groups = [ { groupName: 'a' } ];
    component.saveChanges();
    expect(updateTreatmentsSpy).toHaveBeenCalled();
    expect(updateTreatmentsSpy.calls.mostRecent().args[0]).toEqual((<any>component).groups);
  });

  it('should dispatch treatments update (updateTreatments)', () => {
    const setActiveTreatmentsRecordGroupsSpy = spyOn(treatmentsActions, 'setActiveTreatmentsRecordGroups').and.callFake(() => {});
    const dispatchSpy = spyOn(store, 'dispatch').and.callFake(() => {});

    (<any>component).updateTreatments();
    expect(setActiveTreatmentsRecordGroupsSpy).toHaveBeenCalledWith({ template: component.template, groups: component.groups });
    expect(dispatchSpy).toHaveBeenCalled();
  });

});
