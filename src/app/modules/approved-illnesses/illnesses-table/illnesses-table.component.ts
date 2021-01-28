import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input, OnChanges, SimpleChanges, SimpleChange} from "@angular/core";
import {IllnessService} from "../../../services";
import {pageSizes} from "../../../app.config";
import {take} from "rxjs/operators";

@Component({
  selector: "mica-illnesses-table",
  templateUrl: "./illnesses-table.component.html",
  styleUrls: ["./illnesses-table.component.sass"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IllnessesTableComponent implements OnChanges, OnInit {
  @Input() symptomData: any;
  illnessData = [];
  pageSizes: number[] = pageSizes;
  pageSize: number = this.pageSizes[0];
  page = 1;
  totalElements = 0;
  dataavail = false;
  constructor(private illness: IllnessService, private cd: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges) {
    const symptomData: SimpleChange = changes.symptomData;
    if (!symptomData.previousValue) {
      return;
    }
    if (symptomData.currentValue.symptomID !== ""
      && (symptomData.currentValue.symptomID !== symptomData.previousValue.symptomID
        || symptomData.currentValue.symptomName !== symptomData.previousValue.symptomName)
    ) {
      this.page = 1;
      this.totalElements = 0;
      this.pageSize = this.pageSizes[0];
      this.illnessData = [];
      this.dataavail = false;
      this.getIllnessesData();
    } else if (symptomData.currentValue.symptomID === "") {
      this.page = 1;
      this.totalElements = 0;
      this.pageSize = this.pageSizes[0];
      this.illnessData = [];
      this.dataavail = false;
    }
  }

  ngOnInit() {
    if (this.symptomData.symptomID) {
      this.getIllnessesData();
    }
  }

  setPageSize(size: number) {
    if (this.pageSize === size)
      return;
    this.pageSize = size;
    this.changePage(1);
  }

  changePage(page: number) {
    this.page = page;
    this.getIllnessesData();
    window.scrollTo(0, 0);
  }

  getIllnessesData() {
    return this.illness.getApprovedIllnesses(this.symptomData.symptomID, this.page, this.pageSize)
      .pipe(
        take(1)
      )
      .subscribe((res: any) => {
      this.dataavail = true;
      if (res.content) {
        this.illnessData =  res.content;
      }
      this.totalElements = res.totalElements;
      this.cd.detectChanges();
    });
  }

}
