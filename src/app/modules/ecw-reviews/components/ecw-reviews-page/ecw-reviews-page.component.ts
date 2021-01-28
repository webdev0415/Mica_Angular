import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { Router} from "@angular/router";
import { NgRedux, select } from "@angular-redux/store";
import {setEcwActiveIllness, setEcwParams, upsertEcwIllness } from "../../../../state/ecw/ecw.actions";

import { pageSizes } from "../../../../app.config";
import { EcwService } from "../../../../services/ecw.service"

@Component({
  selector: "ecw-reviews-page",
  templateUrl: "./ecw-reviews-page.component.html",
  styleUrls: ["./ecw-reviews-page.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EcwReviewsPageComponent implements OnInit, OnDestroy {
  private ecwSub: Subscription;
  loadingData = false;
  illnesses: ECW.Illness[] = [];
  totalElements = 0;
  pageSizes: number[] = pageSizes;
  pageSize: number = this.pageSizes[0];
  page = 1;
  filter: ECW.AnyState;
  private get state() { return this.s.getState() };

  constructor(private cd: ChangeDetectorRef,
              private EcwService: EcwService,
              private router: Router,
              private s: NgRedux<State.Root>
            ) { }
  ngOnInit() {
    const {filter, page, pageSize} = this.state.ecw.params
    this.filter = filter;
    this.page = page;
    this.pageSize = pageSize;
    this.ecwSub = this.getEcwIllnesses();
  }

  setPageSize(size: number) {
    if (this.pageSize === size)
      return;
    this.pageSize = size;
    this.changePage(1);
  }

  changePage(page: number) {
    this.page = page;
    this.dispathParams();

    if (this.loadingData)
      this.ecwSub.unsubscribe();
    this.ecwSub = this.getEcwIllnesses();
    window.scrollTo(0, 0);
  }

  onChangeFilter(filter: ECW.AnyState) {
    this.filter = filter;
    this.dispathParams();
  }

  dispathParams() {
    const { filter, page, pageSize } = this;
    this.s.dispatch(setEcwParams({ filter, page, pageSize }));
  }

  getEcwIllnesses (): Subscription {
    this.loadingData = true;

    return this.EcwService.getIllnesses(this.page, this.pageSize)
      .subscribe((res: ECW.Response) => {
        this.illnesses = res.content;
        this.totalElements = res.totalElements;
        this.loadingData = false;
        this.cd.markForCheck();
      }, this.onGetEcwIllnessesError.bind(this))
  }

  goToReview(illness: ECW.Illness) {
    if (!illness) {
      return;
    }
    this.s.dispatch(setEcwActiveIllness(illness));
    this.getIllnessData(illness.icd10Code);
  }

  getIllnessData(code: string): Subscription {
    this.loadingData = true;

   return this.EcwService.getIllnessByIcd10Code(code)
      .subscribe((userData: ECW.IllnessData[]) => {
        this.s.dispatch(upsertEcwIllness(userData[0]))
        this.loadingData = false;
        this.cd.markForCheck();
        this.router.navigate(['ecw-reviews/editor/review']);
      }, this.onGetIllnessDataError.bind(this))
  }

  ngOnDestroy() {
  }

  private onGetIllnessDataError(err: any) {
    this.loadingData = false;
    this.cd.markForCheck();
    throw Error(err);
  }

  private onGetEcwIllnessesError(err: any) {
    this.illnesses = [];
    this.totalElements = 0;
    this.loadingData = false;
    this.cd.markForCheck();
    throw Error(err);
  }
}
