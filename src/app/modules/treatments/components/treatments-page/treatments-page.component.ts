import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { setCurrentApp } from '../../../../state/global/global.actions';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'mica-treatments-page',
  templateUrl: './treatments-page.component.html',
  styleUrls: ['./treatments-page.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreatmentsPageComponent implements OnInit {

  constructor(private s: NgRedux<State.Root>) { }

  ngOnInit() {
    this.s.dispatch(setCurrentApp('treatments'));
  }

}
