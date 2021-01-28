import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TableValueComponent } from "./table-value.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgRedux } from "@angular-redux/store";
const state: State.Root = {} as State.Root;
const mockRedux = {
  getState: () => {
    return state
  },
  dispatch: (arg: any) => {
  }
};

describe("TableValueComponent", () => {
  let component: TableValueComponent;
  let fixture: ComponentFixture<TableValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableValueComponent ],
      imports: [ NgbModule ],
      providers: [
        {provide: NgRedux, useValue: mockRedux}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
