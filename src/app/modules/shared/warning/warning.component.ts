import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mica-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarningComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
