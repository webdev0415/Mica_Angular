import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TreatmentGroupComponent } from './treatment-group.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialogModule, MatIconModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StoreModule } from '@ngrx/store';
import { TreatmentInfoComponent } from './treatment-info/treatment-info.component';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { PipesModule } from '../../../pipes/pipes.module';
import { SharedModule } from '../../../shared/shared.module';
type DrugDesc = Treatments.Drug.Description;
type NonDrugDesc = Treatments.NonDrug.Description;

@Component({
  selector: 'mica-add-treatment-form',
  template: '<div></div>'
})
class MockAddDrugComponent {
  @Input() treatment: DrugDesc | NonDrugDesc;
  @Input() template: Treatments.Types.Template;
  @Input() items: (DrugDesc | NonDrugDesc)[];
  @Input() excludeItems: (DrugDesc | NonDrugDesc)[];
  @Input() sourcesData: SourceInfo.SourcesDictionary;
  @Input() isDrugTreatment: boolean;
  @Input() recordType: 'symptom' | 'illness';

  @Output() addTreatment: EventEmitter<{ treatment: DrugDesc | NonDrugDesc, details?: Treatments.Types.TreatmentTypeDescTemplate }> = new EventEmitter();
  @Output() saveChanges: EventEmitter<void> = new EventEmitter();
}

describe('TreatmentGroupComponent', () => {
  let component: TreatmentGroupComponent;
  let fixture: ComponentFixture<TreatmentGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        MatIconModule,
        DragDropModule,
        MatDialogModule,
        MatListModule,
        MatDividerModule,
        PipesModule,
        StoreModule.forRoot({})
      ],
      declarations: [
        TreatmentGroupComponent,
        MockAddDrugComponent,
        TreatmentInfoComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle drug-n-drop (drop)', fakeAsync(() => {
    const setActiveTreatmentIdxSpy = spyOn(<any>component, 'setActiveTreatmentIdx').and.callFake(() => {});
    const dropped = new EventEmitter();
    const container = { id: 1 };
    const previousContainer = { id: 1 };
    const event: any = { item: { dropped } };
    const dropEvent: any = {
      isPointerOverContainer: true,
      previousContainer,
      container,
      item: { dropped },
      previousIndex: 0,
      currentIndex: 1
    };

    component.onDrag(<any>event);
    dropped.next(dropEvent);
    tick();
    expect(setActiveTreatmentIdxSpy).not.toHaveBeenCalled();

    component.activeTreatmentIdx = null;
    previousContainer.id = 0;
    container.id = 0;
    component.onDrag(<any>event);
    dropped.next(dropEvent);
    tick();
    expect(setActiveTreatmentIdxSpy).not.toHaveBeenCalled();

    component.activeTreatmentIdx = 0;
    dropEvent.previousIndex = 1;
    previousContainer.id = 1;
    container.id = 0;
    component.onDrag(<any>event);
    dropped.next(dropEvent);
    tick();
    expect(setActiveTreatmentIdxSpy).not.toHaveBeenCalled();

    component.activeTreatmentIdx = 0;
    dropEvent.previousIndex = 0;
    previousContainer.id = 1;
    container.id = 0;
    component.onDrag(<any>event);
    dropEvent.item.dropped.next(dropEvent);
    tick();
    expect(setActiveTreatmentIdxSpy).toHaveBeenCalledWith(null);

    component.activeTreatmentIdx = 1;
    dropEvent.previousIndex = 0;
    previousContainer.id = 1;
    container.id = 0;
    component.onDrag(<any>event);
    dropped.next(dropEvent);
    tick();
    expect(setActiveTreatmentIdxSpy).toHaveBeenCalledWith(0);
  }));

  it('setActiveTreatmentIdx', () => {
    component.setActiveTreatmentIdx(1);
    expect(component.activeTreatmentIdx).toEqual(1);
  });

  it('setActiveTreatmentIdx', () => {
    const setActiveTreatmentIdxSpy = spyOn(<any>component, 'setActiveTreatmentIdx').and.callFake(() => {});
    const dropSpy = spyOn(component.drop, 'next');
    const container = { id: 1 };
    const previousContainer = { id: 1 };
    const dropEvent: any = {
      isPointerOverContainer: true,
      previousContainer,
      container,
      previousIndex: 0,
      currentIndex: 0
    };

    component.onDrop(<any>dropEvent);
    expect(setActiveTreatmentIdxSpy).not.toHaveBeenCalled();
    expect(dropSpy).not.toHaveBeenCalled();

    dropEvent.previousIndex = 0;
    dropEvent.currentIndex = 1;
    component.activeTreatmentIdx = null;
    component.onDrop(<any>dropEvent);
    expect(setActiveTreatmentIdxSpy).not.toHaveBeenCalled();
    expect(dropSpy).toHaveBeenCalledWith(dropEvent);

    dropEvent.currentIndex = 1;
    dropEvent.previousIndex = 0;
    component.activeTreatmentIdx = 0;
    component.onDrop(<any>dropEvent);
    expect(setActiveTreatmentIdxSpy).toHaveBeenCalledWith(1);
    expect(dropSpy).toHaveBeenCalledWith(dropEvent);

    dropEvent.currentIndex = 1;
    dropEvent.previousIndex = 0;
    component.activeTreatmentIdx = 1;
    setActiveTreatmentIdxSpy.calls.reset();
    component.onDrop(<any>dropEvent);
    expect(setActiveTreatmentIdxSpy).toHaveBeenCalledWith(0);
    expect(dropSpy).toHaveBeenCalledWith(dropEvent);

    dropEvent.currentIndex = 0;
    dropEvent.previousIndex = 1;
    component.activeTreatmentIdx = 0;
    setActiveTreatmentIdxSpy.calls.reset();
    component.onDrop(<any>dropEvent);
    expect(setActiveTreatmentIdxSpy).toHaveBeenCalledWith(1);
    expect(dropSpy).toHaveBeenCalledWith(dropEvent);

    dropEvent.currentIndex = 1;
    dropEvent.previousIndex = 0;
    component.activeTreatmentIdx = 2;
    setActiveTreatmentIdxSpy.calls.reset();
    component.onDrop(<any>dropEvent);
    expect(setActiveTreatmentIdxSpy).not.toHaveBeenCalled();
    expect(dropSpy).toHaveBeenCalledWith(dropEvent);

    previousContainer.id = 0;
    container.id = 1;
    dropEvent.currentIndex = 1;
    component.activeTreatmentIdx = 2;
    setActiveTreatmentIdxSpy.calls.reset();
    component.onDrop(<any>dropEvent);
    expect(setActiveTreatmentIdxSpy).toHaveBeenCalledWith(3);
    expect(dropSpy).toHaveBeenCalledWith(dropEvent);

    previousContainer.id = 0;
    container.id = 1;
    dropEvent.currentIndex = 1;
    component.activeTreatmentIdx = 0;
    setActiveTreatmentIdxSpy.calls.reset();
    component.onDrop(<any>dropEvent);
    expect(setActiveTreatmentIdxSpy).not.toHaveBeenCalled();
    expect(dropSpy).toHaveBeenCalledWith(dropEvent);
  });

  it('getTreatmentDetailsById', () => {
    component.template = <any>{ treatmentTypeDesc: [ { typeDescID: 1 } ] };
    expect((<any>component).getTreatmentDetailsById(1)).toBeTruthy();
  });

  it('groupItems', () => {
    const getTreatmentDetailsByIdSpy = spyOn(<any>component, 'getTreatmentDetailsById').and.returnValue({});

    component.group = null;
    expect(component.groupItems).toEqual([]);

    component.isDrugTreatment = false;

    component.group = <any>{};
    getTreatmentDetailsByIdSpy.calls.reset();
    expect(component.groupItems).toEqual([]);
    expect(getTreatmentDetailsByIdSpy).not.toHaveBeenCalled();

    component.group = <any>{ nonDrugs: [ { typeDescID: 1 } ] };
    getTreatmentDetailsByIdSpy.calls.reset();
    expect(component.groupItems.length).toEqual(1);
    expect(getTreatmentDetailsByIdSpy).toHaveBeenCalledWith(1);

    component.isDrugTreatment = true;

    component.group = <any>{ drugs: [ { typeDescID: 1 } ] };
    getTreatmentDetailsByIdSpy.calls.reset();
    expect(component.groupItems.length).toEqual(1);
    expect(getTreatmentDetailsByIdSpy).not.toHaveBeenCalled();

    component.group = <any>{};
    getTreatmentDetailsByIdSpy.calls.reset();
    expect(component.groupItems).toEqual([]);
    expect(getTreatmentDetailsByIdSpy).not.toHaveBeenCalled();
  });

  it('activeTreatment', () => {
    component.activeTreatmentIdx = 0;

    component.group = <any>{ nonDrugs: ['nonDrugs'] };
    expect(component.activeTreatment).toEqual(<any>'nonDrugs');

    component.group = <any>{ drugs: ['drugs'] };
    expect(component.activeTreatment).toEqual(<any>'drugs');
  });

  it('trackByFunc', () => {
    expect(component.trackByFunc(1, {})).toEqual(1);
  });
});
