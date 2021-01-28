import {ChangeDetectorRef, Component, OnInit} from "@angular/core";
import {select} from "@angular-redux/store";
import {Observable, Subscription} from "rxjs/Rx";
import {activeSymptomGroup} from "../../../../state/nav/nav.selectors";
import {pageSizes, snomedPage} from "../../../../app.config";
import {FormControl, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {WorkbenchService} from "../../services/workbench.service";

@Component({
  selector: "mica-create-symptom",
  templateUrl: "./create-symptom.component.html",
  styleUrls: ["./create-symptom.component.sass"]
})
export class CreateSymptomComponent implements OnInit{
  @select(activeSymptomGroup) symptomGroup: Observable<String>;

  pageSizes: number[] = snomedPage;
  pageSize: number = this.pageSizes[0];
  page = 1;
  searchCtrl = new FormControl("", Validators.required);

  private snoMedSub: Subscription;
  loadingData = false;
  searchFailed = false;
  snoMedSymptoms = [{symptomId: "1", name: "snomed symptom 1"},
    {symptomId: "2", name: "snomed symptom 2"},
    {symptomId: "3", name: "snomed symptom 3"},
    {symptomId: "4", name: "snomed symptom 4"},
    {symptomId: "5", name: "snomed symptom 5"}];
  totalElements = 0;

  constructor(private router: Router, private workbenchService: WorkbenchService) { }

  ngOnInit() {
    // this.snoMedSub = this.getSnoMedSymptoms();
  }

  filterSymptoms(event: any) {
    if (event.target.value.length >= 3) {
      // return this.workbenchService.getSnoMedSymptoms(this.page, this.pageSize)
      //   .subscribe((response: any) => {
      //     this.snoMedSymptoms =  response;
      //   }, error => {
      //     this.snoMedSymptoms = [];
      //     throw Error(error);
      //   });
    }
  }

  editSymptom(symp: any) {
    // this.workbenchService.setSelectedSnoMedSymptom(symp);
    this.router.navigateByUrl("/workbench/edit-symptom");
  }

  setPageSize(size: number) {
    if (this.pageSize === size)
      return;
    this.pageSize = size;
    this.changePage(1);
  }

  changePage(page: number) {
    this.page = page;
    if (this.loadingData)
      this.snoMedSub.unsubscribe();
    // this.snoMedSub = this.getSnoMedSymptoms();
    window.scrollTo(0, 0);
  }

  // getSnoMedSymptoms (): Subscription {
  //   this.loadingData = true;
  //
  //   return this.SnoMedService.getSymptoms(this.page, this.pageSize)
  //     .subscribe((res:ECW.Response) => {
  //       this.snoMedSymptoms = res.content;
  //       this.totalElements = res.totalElements;
  //       this.loadingData = false;
  //       this.cd.markForCheck();
  //     }, err => {
  //       this.illnesses = [];
  //       this.totalElements = 0;
  //       this.loadingData = false;
  //       this.cd.markForCheck();
  //       throw Error(err);
  //     })
  // }
}
