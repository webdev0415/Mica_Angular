import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TestAppComponent,
  TestModalContentComponent,
  MockTypeaheadComponent,
  MockTreatmentGroupComponent,
  MockSourceFormComponent
} from './components-stubs';
import { TestComponent } from './test.component';

@NgModule({
  declarations: [
    TestAppComponent,
    TestModalContentComponent,
    MockTypeaheadComponent,
    TestComponent,
    MockTreatmentGroupComponent,
    MockTypeaheadComponent,
    MockSourceFormComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TestAppComponent,
    TestModalContentComponent,
    MockTypeaheadComponent,
    TestComponent,
    MockTreatmentGroupComponent,
    MockTypeaheadComponent,
    MockSourceFormComponent
  ]
})
export class MicaTestModule { }
