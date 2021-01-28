import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { selectSymptomSourceByID } from 'app/state/source/source.selectors';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'source-tooltip',
  templateUrl: './source-tooltip.component.html',
  styleUrls: ['./source-tooltip.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class SourceTooltipComponent implements OnInit {
  @Input() info: Symptom.RowValue;
  data: string[];
  private get state() {
    return this.s.getState()
  }

  constructor(private s: NgRedux<State.Root>) { }

  ngOnInit(): void {
    this.data = this.getSourceInfo(this.info);
  }

  getSourceInfo(row: Symptom.RowValue | undefined): string[]  {
    const tooltip: string[] = [];

    if (row && row.sourceInfo) {
      row.sourceInfo.forEach(type => {
        const data = selectSymptomSourceByID(type.sourceID)(this.state);

        if (data.source) {
          tooltip.push(`Source: ${data.source}`);
        }

        if (data.sourceType) {
          tooltip.push(`Type: ${data.sourceType}`);
        }

        if (type.sourceRefDate) {
          tooltip.push(`Date: ${new Date(type.sourceRefDate).toLocaleDateString()}`);
        }
      });
    }

    return tooltip;
  }

}
