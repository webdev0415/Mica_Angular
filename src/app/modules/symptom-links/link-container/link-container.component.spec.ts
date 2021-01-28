import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkContainerComponent } from './link-container.component';

describe('LinkContainerComponent', () => {
  let component: LinkContainerComponent;
  let fixture: ComponentFixture<LinkContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
