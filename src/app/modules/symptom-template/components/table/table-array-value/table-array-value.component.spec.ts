import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TableArrayValueComponent } from "./table-array-value.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";


describe("TableArrayValueComponent", () => {
  let component: TableArrayValueComponent;
  let fixture: ComponentFixture<TableArrayValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableArrayValueComponent ],
      imports: [ NgbModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableArrayValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
