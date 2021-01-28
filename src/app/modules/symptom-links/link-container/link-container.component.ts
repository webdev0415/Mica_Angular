import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { NgRedux } from '@angular-redux/store';
import { setCurrentApp } from '../../../state/global/global.actions';

@Component({
  selector: 'mica-link-container',
  templateUrl: './link-container.component.html',
  styleUrls: ['./link-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkContainerComponent implements OnInit {


  constructor(private s: NgRedux<State.Root>, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.s.dispatch(setCurrentApp('symptomLink'));
    setTimeout(() => {
      this.cd.markForCheck()
    },         100)
  }

}

