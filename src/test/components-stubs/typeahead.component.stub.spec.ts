import { Component, EventEmitter, Input, Output, TemplateRef } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "mica-typeahead",
  template: "<div></div>"
})
export class MockTypeaheadComponent {
  @Input() readOnly = false;
  @Input() title = "";
  @Input() enableValidation = true;
  @Input() canClose = true;
  @Input() small = false;
  @Input() typeAheadMin = 2;
  @Input() valueValid: string;
  @Input() excludeItems: string[] = [];
  @Input() resultKey: "name" | "value";
  @Input() placeholder = "Search...";
  @Input() items: MICA.SelectableEl[];
  @Input() urlQuery = "";
  @Input() liveSearchType: MICA.LiveSearchType;
  @Input() templateRef: TemplateRef<any>;
  @Input() dropdownAlignment = "left";
  @Input() sortByKey: string | string[] = "name";
  @Input() required = true;
  @Input() formControl: any;
  @Input() removeSelectedValues = true;
  @Input() icd10CodeSearch: boolean;
  @Input() maxLength: number;

  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() select: EventEmitter<string | number> = new EventEmitter();
  @Output() noSearch: EventEmitter<boolean> = new EventEmitter();
  @Output() searching: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Output() searchInputChanges: EventEmitter<void> = new EventEmitter();
}
