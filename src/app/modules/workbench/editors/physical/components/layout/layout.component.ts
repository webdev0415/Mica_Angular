import { postMsg } from "app/state/messages/messages.actions";
import { setActiveCategory } from "app/state/nav/nav.actions";
import { activeCategoryID } from "app/state/nav/nav.selectors";
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from "@angular/core";
import { trigger, state, style, transition, animate } from "@angular/animations";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import * as _ from "lodash";
import { NgRedux } from "@angular-redux/store";
import { activeCatData, catIDFromName } from "app/state/symptoms/symptoms.selectors";
import { filter, pluck } from "rxjs/operators";

@Component({
  selector: "mica-physical",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("fadeIn", [
      state("animated", style({ opacity: 1 })),
      transition("void => animated", [
        style({ opacity: 0 }),
        animate("500ms ease-out")
      ])
    ]),
  ],
})
export class WorkbenchPhysicalLayoutComponent implements OnInit, OnDestroy {
  bodySelectedPath: MICA.BodyImage.SelectedPath;
  defaultBodyPart = "";
  svgShapes: MICA.BodyImage.ViewSVGMap;
  bodyPartsAll: string[] = []; // used to track left/right body parts
  bodyPartsSelected: string[] = [];

  private subs: Subscription[] = [];
  private animateCategory = false; // whether to animate on first load, only when changing categories
  private catID: string;

  constructor(private s: NgRedux<State.Root>,
              private route: ActivatedRoute) {
    this.setSvgShapes(route);
  }

  get state() {
    return this.s.getState();
  }

  get bodyPartActiveData() {
    return activeCatData(this.state);
  }

  get hasMultiPartSelection(): boolean {
    return this.bodyPartsAll && this.bodyPartsAll.length > 1;
  }

  get noBodyPartMatch(): string {
    return this.activeCategoryID === "" ? (this.bodySelectedPath ? this.bodySelectedPath[2] : "") : "";
  }

  get activeView(): string {
    return this.bodySelectedPath && this.bodySelectedPath[0];
  }

  get categoryState() {
    return this.animateCategory ? "animated" : "non-animated";
  }

  ngOnInit() {
    const paramSub = this.route.queryParams
      .pipe(
         filter(params => _.has(params, "bodyPart")),
         pluck("bodyPart")
      )
      .subscribe(this.setDefaultBodyPart.bind(this));

    this.subs.push(paramSub);
  }

  ngOnDestroy() {
    _.each(this.subs, sub => sub.unsubscribe());
  }

  onBodyPartSelect(input: MICA.BodyImage.Output) {
    if (_.isEqual(input.selectedPath, this.bodySelectedPath) && _.isEqual(input.bodyParts, this.bodyPartsAll)) {
      return;
    }

    try {
      this.bodySelectedPath = input.selectedPath;
      this.bodyPartsAll = input.bodyParts;
      this.bodyPartsSelected = this.bodySelectedPath ? this.bodySelectedPath[3] : [];
      this.animateCategory = true;

      this.catID = catIDFromName(input.selectedPath[2])(this.state);
      this.s.dispatch(setActiveCategory(this.catID));
    } catch (error) {
      this.s.dispatch(postMsg(
        error.message || "Unable to find symptoms for the selection",
        { type: "warning" }
      ));
    }
  }

  private get activeCategoryID(): string {
    return activeCategoryID(this.state);
  };

  private setDefaultBodyPart(bodyPart: string) {
    this.defaultBodyPart = bodyPart;
  }

  private setSvgShapes(route: ActivatedRoute) {
    const routeData = route.snapshot.data;

    this.svgShapes = routeData.shapes;
  }

}
