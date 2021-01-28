import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  forwardRef, HostListener, ElementRef
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl
} from "@angular/forms";
import { select } from "@angular-redux/store";
import * as _ from "lodash";
import { Observable, Subscription } from "rxjs";
import {concat} from "rxjs/observable/concat";
import {of} from "rxjs/observable/of";
import {map, pluck} from "rxjs/operators";

@Component({
  selector: "mica-country",
  templateUrl: "./country.component.html",
  styleUrls: ["./country.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountryComponent),
      multi: true
    }
  ]
})
export class CountryComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() readOnly = false;
  @Input() defaultPlaceholder = "Select a value";
  @Input() excludeValues: [string, string, string][];
  @select([ "global", "countries" ]) countries$: Observable<MICA.Country[]>;
  loadingData = of([]);
  private menuLevel = -1;
  dataByContinent = of({});
  private ctrl = new FormControl(["", "", "", ""]);
  private valueSub = this.ctrl.valueChanges.subscribe(v => this.propagateChange(v));
  propagateChange = (_: any) => {};
  registerOnChange(fn: (_: any) => {}) { this.propagateChange = fn }
  registerOnTouched() { if (this.ctrl.errors) this.ctrl.updateValueAndValidity() }
  writeValue(value: string | number) {if (value !== undefined) this.ctrl.setValue(value) }

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.dataByContinent = this.countries$.pipe(map(cs => _.groupBy(cs, "region")));
    (this.loadingData as any) = concat(of([]), this.countries$.pipe(map(c => false)));
  }

  ngOnDestroy() {
    this.valueSub.unsubscribe();
  }

  get placeholder() {
    return _.findLast(this.ctrl.value, v => !!v) || this.defaultPlaceholder;
  }

  /**
   * CONTINENTS
   */
  get continents() { return  this.dataByContinent.pipe(map(d => _.filter(_.keys(d), k => !!k))) }
  get continent(): string { return this.ctrl.value[0]; }
  setContinent(continent: string) {
    this.ctrl.setValue([continent]);
    this.menuLevel = -1;
  }

  /**
   * REGIONS
   */

  get showRegions(): boolean { return this.menuLevel >= 1 && !!this.continent; }
  get regions() { if (this.continent) return this.countriesByRegion.pipe(map(c => _.keys(c))) }
  get region(): string { return this.ctrl.value[1] || ""; }
  setRegion(region: string) {
    this.ctrl.setValue([this.continent, region]);
    this.menuLevel = -1;
  }


  /**
   * COUNTRIES
   */

  get showCountries(): boolean { return this.menuLevel >= 2 && !!this.region; }
  get excludeCountries(): string[] { return _.map(this.excludeValues, v => v[2]); }
  get country(): string { return this.ctrl.value[2] || ""; }
  get countriesByRegion()  {
    return this.continent
      ? this.dataByContinent.pipe(map((d: any) => _.groupBy(d[this.continent], "subregion")))
      : of({})
  }
  get countries() {
    if (this.region) {
      return (<Observable<MICA.Country[]>>this.countriesByRegion.pipe(pluck(this.region)))
        .pipe(map(cs => _.filter(cs, c => !~_.indexOf(this.excludeCountries, c.name))))
    }
  }

  // don't turn to setter as used in template
  setCountry(country: string) {
    this.ctrl.setValue([this.continent, this.region, country]);
    this.menuLevel = -1;
  }

  /**
   * EVENT LISTENERS
   */

  onToggleDropdown() {
    this.menuLevel = this.menuLevel === -1 ? 0 : -1;
  }

  onNextLevel(level: number, value: string) {
    if (level === 1) this.setContinent(value);
    if (level === 2) this.setRegion(value);
    if (level === 3) this.setCountry(value);
    this.menuLevel = level;
  }

  get showStates(): boolean {
    return this.menuLevel === 3 && this.country === "United States";
  }

  get state(): string {
    return this.ctrl.value[3] || "";
  }

  get states(): Array<string> {
    return [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming"
    ];
  }

  setState(state: string) {
    this.ctrl.setValue([this.continent, this.region, this.country, state]);
    this.menuLevel = -1;
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.menuLevel = -1;
    }
  }


}
