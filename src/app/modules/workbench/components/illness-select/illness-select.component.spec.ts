import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { IllnessSelectComponent } from "./illness-select.component";

describe("IllnessSelectComponent", () => {
  let component: IllnessSelectComponent;
  let fixture: ComponentFixture<IllnessSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IllnessSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IllnessSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
