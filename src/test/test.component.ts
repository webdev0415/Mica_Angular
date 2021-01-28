/**
 * Created by sergeyyudintsev on 06.10.17.
 */

import { Component, TemplateRef, ViewChild } from "@angular/core";

@Component({
  selector: "mica-test",
  template: "<div></div><ng-template #ref></ng-template>"
})

export class TestComponent {
  @ViewChild("ref", {static: false}) templateRef: TemplateRef<any>;
}
