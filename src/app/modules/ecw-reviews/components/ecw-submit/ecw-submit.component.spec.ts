import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EcwSubmitGroupsComponent } from './ecw-submit.component';
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../../../../app.config";

const mockRedux = {
  getState: (): State.Root => defaultState,
  dispatch: (arg: any) => {}
};

describe('EcwSubmitGroupsComponent', () => {
  let component: EcwSubmitGroupsComponent;
  let fixture: ComponentFixture<EcwSubmitGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcwSubmitGroupsComponent ],
      providers: [ {provide: NgRedux, useValue: mockRedux } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcwSubmitGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it("state", () => {
    expect((<any>component).state).toBeDefined();
  });
});
