import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../../../../app.config";
import { GroupsComponent } from './groups.component';

const mockRedux = {
  getState: (): State.Root => defaultState,
};

describe('GroupsComponent', () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
