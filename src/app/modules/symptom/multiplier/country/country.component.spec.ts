import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import * as _ from "lodash";

import { CountryComponent } from "./country.component";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {TitleCasePipe} from "../../../pipes/title-case.pipe";
import {MultiplierLoaderComponent} from "../loader/loader.component";
import {Dictionary} from "lodash";
import {of} from "rxjs/observable/of";
const countries: MICA.Country[] = require("../../../../../test/data/countries.json");

describe("CountryComponent", () => {
  let component: CountryComponent;
  let fixture: ComponentFixture<CountryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CountryComponent,
        TitleCasePipe,
        MultiplierLoaderComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("registerOnChange", () => {
    const testFunc = (_: any): any => {return {}};
    component.registerOnChange(testFunc);
    expect(component.propagateChange).toEqual(testFunc);
  });

  it("registerOnTouched", () => {
    component.registerOnTouched();
  });

  it("writeValue", () => {
    const newValue = "new value";
    component.writeValue(newValue);
    expect(component["ctrl"].value).toEqual(newValue);

    component.writeValue(undefined);
    expect(component["ctrl"].value).toEqual(newValue);
  });

  it("get placeholder", () => {
    expect(component.placeholder).toEqual(component.defaultPlaceholder);
  });

  it("get continents", () => {
    const countriesDictionary: Dictionary<MICA.Country[]> = _.groupBy(countries, "region");
    component.dataByContinent = of(countriesDictionary);
    component.continents.subscribe(c => expect(_.keys(countriesDictionary).length).toEqual(c.length));
  });

  it("get continent", () => {
    const country = countries[0];
    const value = [country.region, country.subregion, ""];
    component["ctrl"].setValue(value);
    expect(component.continent).toEqual(value[0])
  });

  it("setContinent", () => {
    const country = countries[0];
    const continent = country.region;
    component.setContinent(continent);
    expect(component["ctrl"].value[0]).toEqual(continent);
  });

  it("get showRegions", () => {
    const country = countries[0];
    const value = [country.region, country.subregion, ""];

    expect(component.showRegions).toBeFalsy();

    component["ctrl"].setValue(value);
    component["menuLevel"] = 3;
    expect(component.showRegions).toBeTruthy();
  });

  it("get regions", () => {
    const countriesDictionary: Dictionary<MICA.Country[]> = _.groupBy(countries, "subregion");
    const country = countries[0];
    const value = [country.region, country.subregion, ""];
    spyOnProperty(component, "countriesByRegion", "get").and.returnValue(of(countriesDictionary));
    component["ctrl"].setValue(value);

    component.regions.subscribe(c => expect(_.keys(countriesDictionary).length).toEqual(c.length));
  });

  it("get region", () => {
    const country = countries[0];
    const value = [country.region, country.subregion, ""];
    component["ctrl"].setValue(value);

    expect(component.region).toEqual(country.subregion);
  });

  it("setRegion", () => {
    const country = countries[0];
    const value = [country.region, "", ""];
    component["ctrl"].setValue(value);

    component.setRegion(country.subregion);
    expect(component["ctrl"].value[1]).toEqual(country.subregion);
  });

  it("showCountries", () => {
    const country = countries[0];
    const value = [country.region, country.subregion, ""];
    component["ctrl"].setValue(value);

    component["menuLevel"] = 2;
    expect(component.showCountries).toBeTruthy();

    component["menuLevel"] = 1;
    expect(component.showCountries).toBeFalsy();
  });

  it("excludeCountries", () => {
    const country = countries[0];
    const value = [country.region, country.subregion, country.name];
    component.excludeValues = [value as [string, string, string]];

    expect(component.excludeCountries).toEqual([country.name]);
  });

  it("get country", () => {
    const country = countries[0];
    const value = [country.region, country.subregion, country.name];
    component["ctrl"].setValue(value);

    expect(component.country).toEqual(country.name);
  });

  it("get countries", () => {
    const country = countries[0];
    const value = [country.region, country.subregion, country.name];
    const countriesDictionary: Dictionary<MICA.Country[]> = _.groupBy(countries, "subregion");
    const mockRegion = spyOnProperty(component, "region", "get");
    spyOnProperty(component, "countriesByRegion", "get").and.returnValue(of(countriesDictionary));

    mockRegion.and.returnValue(null);
    expect(component.countries).toBeUndefined();

    mockRegion.and.returnValue(country.subregion);
    component.countries.subscribe(c => expect(c).toEqual(countries));

    component.excludeValues = [value as [string, string, string]];
    component.countries.subscribe(c => expect(c).toEqual([]));
  });

  it("get countriesByRegion", () => {
    const country = countries[0];
    const countriesDictionary: Dictionary<MICA.Country[]> = _.groupBy(countries, "region");
    const mockContinent = spyOnProperty(component, "continent", "get").and.returnValue(country.region);
    component.dataByContinent = of(countriesDictionary);

    component.countriesByRegion.subscribe(c => {
      expect(_.find(c[country.subregion], {name: country.name} as any)).toEqual(country)
    });

    mockContinent.and.returnValue(null);
    component.countriesByRegion.subscribe(c => {
      expect(c).toEqual({})
    });
  });

  it("setCountry", () => {
    const country = countries[0];
    spyOnProperty(component, "continent", "get").and.returnValue(country.region);
    spyOnProperty(component, "region", "get").and.returnValue(country.subregion);

    component.setCountry(country.name);
    expect(component["ctrl"].value[2]).toEqual(country.name);
  });

  it("onToggleDropdown", () => {
    component.onToggleDropdown();
    expect(component["menuLevel"]).toEqual(0);
    component.onToggleDropdown();
    expect(component["menuLevel"]).toEqual(-1);
  });

  it("onNextLevel", () => {
    const country = countries[0];
    const mockSetContinent = spyOn(component, "setContinent").and.callFake(() => {});
    const mockSetRegion = spyOn(component, "setRegion").and.callFake(() => {});

    component.onNextLevel(1, country.region);
    expect(mockSetContinent).toHaveBeenCalledWith(country.region);

    component.onNextLevel(2, country.subregion);
    expect(mockSetRegion).toHaveBeenCalledWith(country.subregion);
  });

  it("should updateValueAndValidity", () => {
    component["ctrl"] = new FormControl("17", Validators.minLength(1));
    const updateValueSpy = spyOn(component["ctrl"], "updateValueAndValidity").and.callThrough();
    component["ctrl"].setErrors({required: true});
    component.registerOnTouched();
    expect(updateValueSpy).toHaveBeenCalled();
  });

  it("regions", () => {
    spyOnProperty(component, "continent", "get").and.returnValue(null);
    expect(component.regions).toBeUndefined();
  });

  it("loadingData", () => {
    const c = [
      {
        name: "country"
      }
    ];
    spyOnProperty(component, "countries$", "get").and.returnValue(of(c));
    component.ngOnInit();
    component.loadingData.subscribe(val => {
      expect(val[0]).toBeFalsy();
    });
  });

  it("dataByContinent", () => {
    const c = [
      {
        region: "r1"
      },
      {
        region: "r2"
      }
    ];
    spyOnProperty(component, "countries$", "get").and.returnValue(of(c));
    component.ngOnInit();
    component.dataByContinent.subscribe(grouped => {
      expect(grouped["r1"]).toBeDefined();
      expect(grouped["r2"]).toBeDefined();
    });
  });

  it("setState", () => {
    const ctrl = new FormControl(["", "", "", "", ""]);
    const continent = "Americas";
    const region = "Northern America";
    const country = "United States";
    const state = "New York";
    spyOnProperty(component, "continent", "get").and.returnValue(continent);
    spyOnProperty(component, "region", "get").and.returnValue(region);
    spyOnProperty(component, "country", "get").and.returnValue(country);

    component["ctrl"] = ctrl;
    component["menuLevel"] = 3;

    component.setState(state);

    expect(component.state).toEqual(state);
    expect(component["menuLevel"]).toEqual(-1);
  });

  it("getStates", () => {
    expect(component.states[0]).toEqual("Alabama");
  });

  it("showStates", () => {
    const country = "United States";
    component["menuLevel"] = 3;
    spyOnProperty(component, "country", "get").and.returnValue(country);
    expect(component.showStates).toBeTruthy();
  });

  it("onNextLevel", () => {
    const level = 3;
    const value = "United States";
    const setCountrySpy = spyOn(component, "setCountry").and.callFake(() => {});
    component["menuLevel"] = -1;
    component.onNextLevel(level, value);
    expect(setCountrySpy).toHaveBeenCalled();
  });

  it("onDocumentClick", () => {
    const nativeElement = document.createElement("div");
    const elementRef = {
      nativeElement: nativeElement
    };
    const target = document.createElement("div");
    const evt = {
      target: target
    } as any;

    spyOn<any>(component, "el").and.returnValue(elementRef);

    component["menuLevel"] = 3;
    component.onDocumentClick(evt);

    expect(component["menuLevel"]).toEqual(-1);
  });

  it("onDocumentClick", () => {
    const target = document.createElement("div");
    const evt = {
      target: target
    } as any;
    const elementRef = {
      nativeElement: target
    };

    component["el"] = elementRef;

    component["menuLevel"] = 3;
    component.onDocumentClick(evt);

    expect(component["menuLevel"]).not.toEqual(-1);
  });

  it("get region", () => {
    const arr = ["Americas"];
    const ctrl = new FormControl(arr);
    component["ctrl"] = ctrl;
    expect(component.region).toEqual("");
  });

  it("get country", () => {
    const arr = ["Americas", "North America"];
    const ctrl = new FormControl(arr);
    component["ctrl"] = ctrl;
    expect(component.country).toEqual("");
  });

  it("get state", () => {
    const arr = ["Americas", "North America", "United States"];
    const ctrl = new FormControl(arr);
    component["ctrl"] = ctrl;
    expect(component.state).toEqual("");
  });
});
