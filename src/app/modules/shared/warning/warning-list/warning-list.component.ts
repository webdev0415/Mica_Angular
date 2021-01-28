import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mica-warning-list',
  templateUrl: './warning-list.component.html',
  styleUrls: ['./warning-list.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarningListComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
